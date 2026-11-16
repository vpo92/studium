// @flow
/**
 * Section `bibliography` : création/dédoisonnement des :Document sources et
 * rattachement à la personne.
 */

const { asArray } = require('./model');

const BIBLIOGRAPHY_FIELDS = [
  'workReferences',
  'bookReferences',
  'otherBases',
];

function extractBibliography(prosopography, model) {
  const bibliography = prosopography.bibliography || {};

  BIBLIOGRAPHY_FIELDS.forEach(field => {
    asArray(bibliography[field]).forEach(entry => {
      const reference = entry && entry.value !== undefined ? entry.value : entry;
      const source = model.addSource(reference, `bibliography:${field}`);
      if (source) {
        model.bibliography.push({
          norm_key: source.norm_key,
          category: field,
        });
      }
    });
  });

  return model;
}

module.exports = {
  BIBLIOGRAPHY_FIELDS,
  extractBibliography,
};
