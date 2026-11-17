// @flow
/**
 * Service d'ingestion Neo4j du modèle DAPHNE v2.
 */

const { buildGraph, summarizeGraph, SECTION_PIPELINE } = require('./builder');
const { syncProsopography, syncFile, readJsonFile } = require('./sync');
const { getConfig, createDriver, loadEnvFile, loadDefaultEnv } = require('./config');
const { writeGraph, prepareGraph } = require('./writer');
const { verifyImport } = require('./verify');
const {
  findGraphByReference,
  getConnection,
  closeDriver,
  DEFAULT_DEPTH,
  MAX_DEPTH,
} = require('./reader');

module.exports = {
  SECTION_PIPELINE,
  buildGraph,
  summarizeGraph,
  readJsonFile,
  syncProsopography,
  syncFile,
  getConfig,
  createDriver,
  loadEnvFile,
  loadDefaultEnv,
  prepareGraph,
  writeGraph,
  verifyImport,
  findGraphByReference,
  getConnection,
  closeDriver,
  DEFAULT_DEPTH,
  MAX_DEPTH,
};
