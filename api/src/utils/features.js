// @flow
/**
 * Feature flags.
 *
 * Chaque fonctionnalité est pilotée par une variable d'environnement
 * `FEAT_<NOM>` acceptant `true`/`false` (ainsi que `1`/`0`, `yes`/`no`,
 * `on`/`off`). Une valeur absente ou non reconnue laisse la fonctionnalité
 * désactivée par défaut.
 *
 * Les variables déjà définies dans l'environnement du processus ont priorité
 * sur celles d'un éventuel fichier `.env`.
 */

let envLoaded = false;

const TRUE_VALUES = ['1', 'true', 'yes', 'on'];
const FALSE_VALUES = ['0', 'false', 'no', 'off'];

function loadEnvironment() {
  if (envLoaded) {
    return;
  }
  envLoaded = true;
  try {
    // Réutilise le chargeur `.env` existant (api/.env, .env racine, ...).
    require('../services/graph/config').loadDefaultEnv();
  } catch (err) {
    // Les variables d'environnement du processus restent utilisables.
  }
}

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '') {
    return defaultValue;
  }
  if (TRUE_VALUES.indexOf(normalized) !== -1) {
    return true;
  }
  if (FALSE_VALUES.indexOf(normalized) !== -1) {
    return false;
  }
  return defaultValue;
}

function isFeatureEnabled(featureName, defaultValue = false) {
  if (!featureName) {
    return defaultValue;
  }
  loadEnvironment();
  const envName = `FEAT_${String(featureName).toUpperCase()}`;
  return parseBoolean(process.env[envName], defaultValue);
}

/**
 * Active ou désactive les endpoints de graphe (`FEAT_GRAPH`).
 */
function isGraphEnabled() {
  return isFeatureEnabled('GRAPH');
}

module.exports = {
  parseBoolean,
  isFeatureEnabled,
  isGraphEnabled,
};
