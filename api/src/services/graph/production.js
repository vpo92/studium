// @flow
/**
 * Section `textualProduction` (religion, philosophie, science, oeuvres
 * discutées/rejetées, etc.).
 *
 * Une oeuvre est un :Document de type WORK. Ses témoins manuscrits sont des
 * :Exemplaire, ses éditions des :Edition et ses incipits/explicits des
 * :Incipit. L'attribution est portée par la relation PRODUCED et par une
 * propriété sur l'oeuvre (`attribution = certain | rejected`).
 */

const {
  cleanText,
  normKey,
  isPlaceholder,
  certaintyFrom,
  pickDatesFromDateAndPlace,
  parseManuscript,
  parsePersonMentions,
  dedupeBy,
  sha1Short,
} = require('./normalize');
const {
  asArray,
  collectReferences,
  humanizeKey,
} = require('./model');

const PRODUCTION_SECTION = 'textualProduction';

function cleanValue(entry) {
  if (!entry) {
    return '';
  }
  if (typeof entry === 'string') {
    return cleanText(entry);
  }
  return cleanText(entry.value);
}

function firstClean(entries) {
  const list = asArray(entries);
  for (let i = 0; i < list.length; i += 1) {
    const value = cleanValue(list[i]);
    if (value && !isPlaceholder(value)) {
      return value;
    }
  }
  return '';
}

function workTitle(opus, fallback) {
  if (!opus) {
    return cleanText(fallback);
  }
  if (opus.mainTitle) {
    const mainTitle = cleanText(opus.mainTitle);
    if (mainTitle && !isPlaceholder(mainTitle)) {
      return mainTitle;
    }
  }
  return firstClean(opus.title) || firstClean(opus.versionWork) || firstClean(opus.française) ||
    cleanText(fallback);
}

function titleVariants(opus) {
  return dedupeBy(
    asArray(opus && opus.titleVariant)
      .map(entry => cleanValue(entry))
      .filter(value => value && !isPlaceholder(value)),
    value => normKey(value)
  );
}

function languageOf(opus) {
  const language = firstClean(opus && opus.language);
  return language || null;
}

function notesOf(opus) {
  if (!opus || typeof opus !== 'object') {
    return null;
  }
  const notes = [];

  const pushValue = value => {
    const clean = cleanText(value);
    if (clean && !isPlaceholder(clean)) {
      notes.push(clean);
    }
  };

  asArray(opus.comment).forEach(pushValue);
  asArray(opus.dateAndPlace).forEach(entry => {
    if (entry && typeof entry.value === 'string' && /^\s*\//.test(entry.value)) {
      pushValue(entry.value);
    }
  });
  asArray(opus.dedicaceOrAdress).forEach(entry => pushValue(cleanValue(entry)));
  asArray(opus.colophon).forEach(entry => pushValue(cleanValue(entry)));

  return notes.length ? notes.join(' ') : null;
}

function mentionsOf(opus, model) {
  if (!opus || typeof opus !== 'object') {
    return [];
  }
  const mentions = [];
  parsePersonMentions(JSON.stringify(opus), model.selfNameKeys).forEach(mention =>
    mentions.push(mention)
  );
  return dedupeBy(mentions, mention => mention.norm_key);
}

function sourcesOf(value, model, role) {
  return dedupeBy(
    collectReferences(value)
      .map(reference => model.addSource(reference, 'textualProduction'))
      .filter(Boolean)
      .map(source => ({
        norm_key: source.norm_key,
        role: role || 'work_source',
        certainty: 'certain',
      })),
    source => source.norm_key
  );
}

function makeWitness(workKey, entry) {
  const raw = entry && entry.value !== undefined ? entry.value : entry;
  const parsed = parseManuscript(raw);
  if (!parsed) {
    return null;
  }
  const key = `exemplaire:${workKey}:${normKey(parsed.reference)}`;
  return {
    norm_key: key,
    reference: parsed.reference,
    original_text: parsed.original_text,
    archivingLocation: parsed.archivingLocation,
    sheet: parsed.sheet,
    scribeName: parsed.scribeName,
    certainty: parsed.certainty,
  };
}

function makeEdition(workKey, entry, editionType) {
  const raw = entry && entry.value !== undefined ? entry.value : entry;
  const text = cleanText(raw);
  if (!text || isPlaceholder(text)) {
    return null;
  }

  const date = pickDatesFromDateAndPlace([entry]);
  const meta = (entry && entry.meta) || {};
  const places = dedupeBy(
    asArray(meta.places)
      .map(place => cleanText(place))
      .filter(Boolean)
      .map(place => ({
        norm_key: `place:${normKey(place)}`,
        place_id: `place:${normKey(place)}`,
        place_description: place,
        name: place,
      })),
    place => place.norm_key
  );

  const key = `edition:${workKey}:${normKey(editionType)}:${sha1Short(text, 12)}`;
  return {
    norm_key: key,
    edition_id: key,
    edition_type: editionType,
    title: text,
    original_text: String(raw).trim(),
    notes: text,
    publicationdate: date.date_start,
    date_start: date.date_start,
    date_end: date.date_end,
    date_display: date.date_display,
    pages: null,
    editor: null,
    places: places,
  };
}

function makeIncipit(workKey, entry, kind) {
  const raw = entry && entry.value !== undefined ? entry.value : entry;
  const text = cleanText(raw);
  if (!text || isPlaceholder(text) || /^Inc\.?\s*:?\s*$/i.test(text)) {
    return null;
  }
  const key = `incipit:${workKey}:${kind}:${sha1Short(text, 12)}`;
  return {
    norm_key: key,
    incipit_id: key,
    kind: kind,
    text: text,
    original_text: String(raw).trim(),
  };
}

function editionEntries(opus) {
  const result = [];
  if (!opus || typeof opus !== 'object') {
    return result;
  }
  Object.keys(opus).forEach(key => {
    if (!/edition/i.test(key)) {
      return;
    }
    asArray(opus[key]).forEach(entry => {
      if (entry && typeof entry === 'object' && entry.value !== undefined) {
        result.push({
          entry: entry,
          editionType: /modern/i.test(key) ? 'modern' : 'early_modern',
        });
      }
    });
  });
  return result;
}

function incipitEntries(opus) {
  const result = [];
  if (!opus || typeof opus !== 'object') {
    return result;
  }
  const add = (entries, kind) => {
    asArray(entries).forEach(entry => {
      if (entry && typeof entry === 'object' && entry.value !== undefined) {
        result.push({ entry: entry, kind: kind });
      }
    });
  };
  add(opus.incipits, 'incipit');
  add(opus.explicit, 'explicit');
  add(opus.explicits, 'explicit');
  add(opus.colophon, 'colophon');
  return result;
}

function buildWork(options) {
  const opus = options.opus || {};
  const model = options.model;
  const sectionKey = options.sectionKey;
  const sectionValue = options.sectionValue;
  const parentKey = options.parentKey || null;
  const index = options.index || 0;
  const rejected = options.rejected === true;

  const title = options.titleOverride || workTitle(opus, `${humanizeKey(sectionKey)} ${index + 1}`);
  const titleKey = normKey(title);
  let workKey;
  let norm_key;
  if (parentKey) {
    norm_key = `${parentKey}:version:${index}:${titleKey}`;
    workKey = norm_key.replace(/^document:/, '');
  } else {
    workKey = `work:${model.mongoId}:${sectionKey}:${index}:${titleKey}`;
    norm_key = `document:${workKey}`;
  }
  const date = pickDatesFromDateAndPlace(opus.dateAndPlace);

  const witnesses = dedupeBy(
    asArray(opus.manuscrits)
      .map(entry => makeWitness(norm_key, entry))
      .filter(Boolean),
    witness => witness.norm_key
  );

  const editions = dedupeBy(
    editionEntries(opus)
      .map(item => makeEdition(norm_key, item.entry, item.editionType))
      .filter(Boolean),
    edition => edition.norm_key
  );

  const incipits = dedupeBy(
    incipitEntries(opus)
      .map(item => makeIncipit(norm_key, item.entry, item.kind))
      .filter(Boolean),
    incipit => incipit.norm_key
  );

  return {
    norm_key: norm_key,
    doc_id: norm_key,
    source_id: norm_key,
    work_id: workKey,
    mongo_id: model.mongoId,
    reference: model.reference,
    doc_type: 'WORK',
    name: title,
    title: title,
    mainTitle: title,
    title_variants: titleVariants(opus),
    language: languageOf(opus),
    section: sectionKey,
    section_label: cleanText(sectionValue) || humanizeKey(sectionKey),
    attribution: rejected ? 'rejected' : 'certain',
    rejected: rejected,
    certainty: rejected ? 'rejected' : certaintyFrom(sectionValue),
    date_start: date.date_start,
    date_end: date.date_end,
    date_type: date.date_type,
    date_display: date.date_display,
    notes: notesOf(opus),
    original_text: null,
    parent_key: parentKey,
    sources: sourcesOf(opus, model, parentKey ? 'version_source' : 'work_source'),
    people: mentionsOf(opus, model),
    witnesses: witnesses,
    editions: editions,
    incipits: incipits,
  };
}

function versionToOpus(version, parentOpus) {
  const source = version || {};
  return {
    title: source.versionWork || source.française || parentOpus.title,
    titleVariant: source.titleVariant,
    dateAndPlace: source.dateAndPlace,
    language: source.language,
    manuscrits: source.manuscrits,
    incipits: source.incipits,
    explicit: source.explicit,
    explicits: source.explicits,
    colophon: source.colophon,
    editionBefore1700: source.editionBefore1700,
    modernEdition: source.modernEdition,
    dedicaceOrAdress: source.dedicaceOrAdress,
    comment: source.comment,
    reference: source.reference,
  };
}

function extractTextualProduction(prosopography, model) {
  const production = prosopography[PRODUCTION_SECTION] || {};

  Object.keys(production).forEach(sectionKey => {
    const section = production[sectionKey];
    if (!section || typeof section !== 'object') {
      return;
    }

    const sectionValue = cleanText(section.value);
    const opusList = asArray(section.opus);
    const rejected =
      /^discussed/i.test(sectionKey) || /rejet|douteu|rejetée|rejeté/i.test(sectionValue);

    opusList.forEach((opus, index) => {
      if (!opus || typeof opus !== 'object') {
        return;
      }

      const work = buildWork({
        opus: opus,
        model: model,
        sectionKey: sectionKey,
        sectionValue: sectionValue,
        index: index,
        rejected: rejected,
      });
      model.works.push(work);

      asArray(opus.versions).forEach((version, versionIndex) => {
        if (!version || typeof version !== 'object') {
          return;
        }
        const versionOpus = versionToOpus(version, opus);
        const versionTitle =
          workTitle(versionOpus, `${work.name} (version ${versionIndex + 1})`) ||
          `${work.name} (version ${versionIndex + 1})`;
        const versionWork = buildWork({
          opus: versionOpus,
          model: model,
          sectionKey: sectionKey,
          sectionValue: sectionValue,
          index: versionIndex,
          parentKey: work.norm_key,
          titleOverride: versionTitle,
          rejected: rejected,
        });
        model.works.push(versionWork);
      });
    });
  });

  return model;
}

module.exports = {
  PRODUCTION_SECTION,
  extractTextualProduction,
  buildWork,
};
