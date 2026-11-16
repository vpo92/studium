// @flow
/**
 * Construction du modèle graphe complet d'une fiche, section par section.
 *
 * La fonction `buildGraph` ne fait aucun accès réseau : elle est utilisable pour
 * les tests et pour un import `--dry-run`.
 */

const { GraphModel } = require('./model');
const { extractIdentity } = require('./identity');
const { extractCareers } = require('./careers');
const { extractBibliography } = require('./bibliography');
const { extractTextualProduction } = require('./production');

const SECTION_PIPELINE = [
  ['identity', extractIdentity],
  ['careers', extractCareers],
  ['bibliography', extractBibliography],
  ['textualProduction', extractTextualProduction],
];

function buildGraph(prosopography) {
  if (!prosopography || typeof prosopography !== 'object') {
    throw new Error('La fiche prosopographique doit être un objet JSON.');
  }

  const model = new GraphModel(prosopography);
  SECTION_PIPELINE.forEach(step => {
    step[1](prosopography, model);
  });
  return model.toJSON();
}

function summarizeGraph(graph) {
  const witnesses = graph.works.reduce(
    (total, work) => total + (work.witnesses ? work.witnesses.length : 0),
    0
  );
  const editions = graph.works.reduce(
    (total, work) => total + (work.editions ? work.editions.length : 0),
    0
  );
  const incipits = graph.works.reduce(
    (total, work) => total + (work.incipits ? work.incipits.length : 0),
    0
  );

  return {
    mongo_id: graph.mongo_id,
    reference: graph.reference,
    person: graph.person ? graph.person.name : null,
    names: graph.names.length,
    factoids: graph.factoids.length,
    works: graph.works.length,
    rejected_works: graph.works.filter(work => work.rejected).length,
    sources: graph.sources.length,
    bibliography_links: graph.bibliography.length,
    witnesses: witnesses,
    editions: editions,
    incipits: incipits,
  };
}

module.exports = {
  SECTION_PIPELINE,
  buildGraph,
  summarizeGraph,
};
