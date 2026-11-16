// @flow
/**
 * Point d'entrée de synchronisation d'une fiche.
 */

const fs = require('fs');
const { buildGraph, summarizeGraph } = require('./builder');
const { writeGraph } = require('./writer');

function readJsonFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  return JSON.parse(content);
}

async function syncProsopography(driver, database, prosopography, options) {
  const opts = options || {};
  const graph = buildGraph(prosopography);
  const summary = summarizeGraph(graph);

  if (opts.dryRun) {
    return {
      graph: graph,
      summary: summary,
      written: null,
    };
  }

  const written = await writeGraph(driver, database, graph, opts);
  return {
    graph: graph,
    summary: summary,
    written: written,
  };
}

async function syncFile(driver, database, file, options) {
  const prosopography = readJsonFile(file);
  return syncProsopography(driver, database, prosopography, options);
}

module.exports = {
  readJsonFile,
  syncProsopography,
  syncFile,
};
