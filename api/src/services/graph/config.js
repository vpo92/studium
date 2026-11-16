// @flow
/**
 * Configuration Neo4j (driver Bolt).
 *
 * Variables d'environnement reconnues :
 * - NEO4J_URI (ex. bolt://localhost:7687)
 * - NEO4J_USER / NEO4J_USERNAME
 * - NEO4J_PASSWORD
 * - NEO4J_DATABASE
 *
 * Un fichier `.env` est chargé automatiquement s'il existe :
 * 1. chemin indiqué par NEO4J_ENV_FILE ;
 * 2. `api/.env` ;
 * 3. `.env` à la racine du dépôt ;
 * 4. `.env` du répertoire courant.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = 7687;

function stripQuotes(value) {
  if (
    (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
    (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Charge un fichier `.env` sans écraser les variables déjà définies.
 * Retourne true si le fichier a été lu.
 */
function loadEnvFile(file) {
  if (!file || !fs.existsSync(file)) {
    return false;
  }

  const content = fs.readFileSync(file, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.charAt(0) === '#') {
      return;
    }
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      return;
    }
    const key = match[1];
    const value = stripQuotes(match[2].trim());
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });

  return true;
}

function envCandidates() {
  const candidates = [];
  if (process.env.NEO4J_ENV_FILE) {
    candidates.push(path.resolve(process.cwd(), process.env.NEO4J_ENV_FILE));
  }
  candidates.push(path.resolve(__dirname, '../../../.env')); // api/.env
  candidates.push(path.resolve(__dirname, '../../../../.env')); // .env racine
  candidates.push(path.resolve(__dirname, '../../../../neo4j/.env'));
  candidates.push(path.resolve(process.cwd(), '.env'));
  return candidates;
}

/**
 * Charge le premier fichier `.env` trouvé.
 */
function loadDefaultEnv() {
  const candidates = envCandidates();
  for (let i = 0; i < candidates.length; i += 1) {
    if (loadEnvFile(candidates[i])) {
      return candidates[i];
    }
  }
  return null;
}

function buildUri(env) {
  if (env.NEO4J_URI) {
    return env.NEO4J_URI;
  }
  if (env.NEO4J_BOLT_URL) {
    return env.NEO4J_BOLT_URL;
  }
  const host = env.NEO4J_HOST || 'localhost';
  const port = env.NEO4J_PORT || DEFAULT_PORT;
  return `bolt://${host}:${port}`;
}

function getConfig(env) {
  if (!env) {
    loadDefaultEnv();
  }
  const source = env || process.env;
  return {
    uri: buildUri(source),
    user: source.NEO4J_USER || source.NEO4J_USERNAME || 'neo4j',
    password: source.NEO4J_PASSWORD || 'neo4j',
    database: source.NEO4J_DATABASE || 'neo4j',
    batchSize: parseInt(source.NEO4J_BATCH_SIZE || '500', 10),
  };
}

function createDriver(config) {
  const neo4j = require('neo4j-driver');
  return neo4j.driver(
    config.uri,
    neo4j.auth.basic(config.user, config.password)
  );
}

module.exports = {
  getConfig,
  createDriver,
  loadEnvFile,
  loadDefaultEnv,
};
