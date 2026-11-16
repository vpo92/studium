// @flow
/**
 * Sections de parcours :
 * `origin`, `relationalInsertion`, `curriculum`, `ecclesiasticalCareer`,
 * `professionalCareer`, `travels`, `commissions`.
 *
 * Chaque étape de vie devient un :Factoid. Les lieux, institutions, personnes
 * citées et sources sont reliés directement au factoid, les dates et rôles
 * étant portés par le noeud ou la relation (pas de noeud TimeInterval, Named
 * ou Participate).
 */

const {
  cleanText,
  normKey,
  isPlaceholder,
  certaintyFrom,
  parseDateMeta,
  parsePersonMentions,
  parseMetaNames,
  dedupeBy,
  sha1Short,
} = require('./normalize');
const {
  asArray,
  forEachInformationEntry,
  getNotes,
  humanizeKey,
} = require('./model');

const CAREER_SECTIONS = [
  'origin',
  'relationalInsertion',
  'curriculum',
  'ecclesiasticalCareer',
  'professionalCareer',
  'travels',
  'commissions',
];

const ROLE_LABELS = {
  birthPlace: 'Lieu de naissance',
  diocese: 'Diocèse',
  movesInOutParis: 'Mobilité Paris',
  university: 'Études universitaires',
  grades: 'Grade universitaire',
  universityCollege: 'Collège universitaire',
  collegeFundations: 'Fondation de collège',
  secularPosition: 'Position séculière',
  regularOrder: 'Ordre régulier',
  regularFunctions: 'Fonction régulière',
  ecclesiasticalStatus: 'Statut ecclésiastique',
  benefits: 'Bénéfice ecclésiastique',
  popFunctions: 'Fonction pontificale',
  otherFunctions: 'Autre fonction',
  professorOrPerceptor: 'Professeur ou précepteur',
  universityFunction: 'Fonction universitaire',
  lawFunction: 'Fonction juridique',
  culturalFunction: 'Fonction culturelle',
  royalAdministration: 'Administration royale',
  medicine: 'Médecine',
  otherJob: 'Autre métier',
  friends: 'Relation sociale',
  studentProfessorRelationships: 'Relation maître-élève',
  travels: 'Déplacement',
  universityCommission: 'Commission universitaire',
};

function roleLabel(key, section) {
  return ROLE_LABELS[key] || humanizeKey(key) || humanizeKey(section);
}

function makePlace(name, role, certainty) {
  const clean = cleanText(name);
  const key = normKey(clean);
  if (!key) {
    return null;
  }
  return {
    norm_key: `place:${key}`,
    place_id: `place:${key}`,
    place_description: clean,
    name: clean,
    role: role,
    certainty: certainty,
  };
}

function makeZone(name, role, certainty) {
  const clean = cleanText(name);
  const key = normKey(clean);
  if (!key) {
    return null;
  }
  return {
    norm_key: `zone:${key}`,
    zone_id: `zone:${key}`,
    zone_description: clean,
    name: clean,
    role: role,
    certainty: certainty,
  };
}

function makeInstitution(name, role, certainty) {
  const clean = cleanText(name);
  const key = normKey(clean);
  if (!key) {
    return null;
  }
  return {
    norm_key: `institution:${key}`,
    domain_id: `institution:${key}`,
    name: clean,
    role: role,
    certainty: certainty,
  };
}

function entryMentions(entry, model) {
  const values = [entry && entry.value]
    .concat(asArray(entry && entry.comment))
    .filter(Boolean);
  const mentions = [];
  values.forEach(value => {
    parsePersonMentions(value, model.selfNameKeys).forEach(mention => mentions.push(mention));
  });
  parseMetaNames(entry && entry.meta, model.selfNameKeys).forEach(mention =>
    mentions.push(mention)
  );
  return dedupeBy(mentions, mention => mention.norm_key);
}

function buildFactoid(model, section, roleKey, entry, index) {
  const rawValue = entry && entry.value !== undefined ? String(entry.value) : '';
  const description = cleanText(rawValue);
  if (!description || isPlaceholder(description)) {
    return null;
  }

  const certainty = certaintyFrom(rawValue, entry && entry.comment);
  const label = roleLabel(roleKey, section);
  const date = parseDateMeta(entry && entry.meta, rawValue);
  const key = `${model.mongoId}:${section}:${roleKey}:${sha1Short(description, 12)}`;
  const role = model.addRole(roleKey, label);

  const meta = (entry && entry.meta) || {};
  const places = dedupeBy(
    asArray(meta.places)
      .map(name => makePlace(name, roleKey, certainty))
      .filter(Boolean),
    place => place.norm_key
  );
  const zones = dedupeBy(
    asArray(meta.zones || meta.zone)
      .map(name => makeZone(name, roleKey, certainty))
      .filter(Boolean),
    zone => zone.norm_key
  );
  const institutions = dedupeBy(
    asArray(meta.institutions)
      .map(name => makeInstitution(name, roleKey, certainty))
      .filter(Boolean),
    institution => institution.norm_key
  );
  const people = entryMentions(entry, model);
  const sources = model.addReferences(entry, section);

  return {
    norm_key: `factoid:${key}`,
    factoid_id: key,
    person_key: model.personKey,
    mongo_id: model.mongoId,
    reference: model.reference,
    category: section,
    role_key: roleKey,
    role_label: label,
    role_norm_key: role.norm_key,
    description: description,
    original_text: rawValue.trim() || null,
    notes: getNotes(entry),
    certainty: certainty,
    date_start: date.date_start,
    date_end: date.date_end,
    date_type: date.date_type,
    date_display: date.date_display,
    places: places,
    zones: zones,
    institutions: institutions,
    people: people,
    sources: sources.map(source => ({
      norm_key: source.norm_key,
      role: 'reference',
      certainty: certainty,
    })),
    item_index: index,
  };
}

function extractCareers(prosopography, model) {
  CAREER_SECTIONS.forEach(sectionName => {
    const section = prosopography[sectionName];
    if (!section) {
      return;
    }
    forEachInformationEntry(section, (entry, roleKey, index) => {
      const factoid = buildFactoid(model, sectionName, roleKey, entry, index);
      if (factoid) {
        model.factoids.push(factoid);
      }
    });
  });
  return model;
}

module.exports = {
  CAREER_SECTIONS,
  ROLE_LABELS,
  roleLabel,
  extractCareers,
};
