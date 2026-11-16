// @flow
/**
 * Section `identity` :
 * - :PhysicalPerson ;
 * - nom principal via la relation MAIN_NAME ;
 * - variantes via la relation NAMED ;
 * - sources attachées aux noms.
 */

const {
  cleanText,
  normKey,
  certaintyFrom,
  parseDateMeta,
} = require('./normalize');
const { asArray } = require('./model');

function firstEntry(value) {
  const entries = asArray(value);
  return entries.length ? entries[0] : null;
}

function extractIdentity(prosopography, model) {
  const identity = prosopography.identity || {};
  const mainNameEntries = asArray(identity.name);
  const variantEntries = asArray(identity.nameVariant);

  const mainName = mainNameEntries.length ? cleanText(mainNameEntries[0].value) : '';
  const variantNames = variantEntries.map(entry => cleanText(entry.value)).filter(Boolean);
  model.registerSelfNames([mainName].concat(variantNames));

  const shortDescriptionEntry = firstEntry(identity.shortDescription);
  const datesOfLifeEntry = firstEntry(identity.datesOfLife);
  const datesOfActivityEntry = firstEntry(identity.datesOfActivity);
  const activityMedianeEntry = firstEntry(identity.activityMediane);
  const genderEntry = firstEntry(identity.gender);
  const statusEntry = firstEntry(identity.status);

  const lifeDates = parseDateMeta(
    datesOfLifeEntry && datesOfLifeEntry.meta,
    datesOfLifeEntry && datesOfLifeEntry.value
  );
  const activityDates = parseDateMeta(
    datesOfActivityEntry && datesOfActivityEntry.meta,
    datesOfActivityEntry && datesOfActivityEntry.value
  );
  const medianeDates = parseDateMeta(
    activityMedianeEntry && activityMedianeEntry.meta,
    activityMedianeEntry && activityMedianeEntry.value
  );

  const personSources = model.addReferences(
    { reference: [].concat(
      (datesOfLifeEntry && datesOfLifeEntry.reference) || [],
      (datesOfActivityEntry && datesOfActivityEntry.reference) || [],
      (identity.name && identity.name[0] && identity.name[0].reference) || []
    ) },
    'identity'
  );

  const gender = genderEntry ? cleanText(genderEntry.value) : null;
  const shortDescription = shortDescriptionEntry
    ? cleanText(shortDescriptionEntry.value)
    : null;

  model.person = {
    norm_key: model.personKey,
    mongo_id: model.mongoId,
    id: model.mongoId,
    reference: model.reference,
    name: mainName || prosopography.title || '',
    title: cleanText(prosopography.title),
    link: prosopography.link || null,
    short_description: shortDescription,
    shortdesc: shortDescription,
    gender: gender,
    genre: gender,
    status: statusEntry ? cleanText(statusEntry.value) : null,
    life_start: lifeDates.date_start,
    life_end: lifeDates.date_end,
    life_display: lifeDates.date_display,
    activity_start: activityDates.date_start,
    activity_end: activityDates.date_end,
    activity_display: activityDates.date_display,
    activityPeriod: activityDates.date_display,
    activity_mediane:
      activityMedianeEntry && activityMedianeEntry.meta && activityMedianeEntry.meta.dates
        ? parseDateMeta(activityMedianeEntry.meta, activityMedianeEntry.value).date_start
        : medianeDates.date_start,
    source_keys: personSources.map(source => source.norm_key),
  };

  // Nom principal
  mainNameEntries.forEach(entry => {
    const completeName = cleanText(entry.value);
    if (!completeName) {
      return;
    }
    const key = normKey(completeName);
    const sources = model.addReferences(entry, 'identity');
    model.names.push({
      norm_key: `name:${model.mongoId}:main:${key}`,
      name_id: `name:${model.mongoId}:main:${key}`,
      completeName: completeName,
      name_type: 'MAIN_NAME',
      certainty: certaintyFrom(entry.value),
      source_keys: sources.map(source => source.norm_key),
    });
  });

  // Variantes
  variantEntries.forEach(entry => {
    const completeName = cleanText(entry.value);
    if (!completeName) {
      return;
    }
    const key = normKey(completeName);
    const sources = model.addReferences(entry, 'identity');
    model.names.push({
      norm_key: `name:${model.mongoId}:variant:${key}`,
      name_id: `name:${model.mongoId}:variant:${key}`,
      completeName: completeName,
      name_type: 'NAMED',
      certainty: certaintyFrom(entry.value),
      source_keys: sources.map(source => source.norm_key),
    });
  });

  return model;
}

module.exports = {
  extractIdentity,
};
