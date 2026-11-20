const conf = require("./config.json");
const { loadDefaultEnv } = require("../src/services/graph/config");

const env = process.env.NODE_ENV || "dev";
const config = Object.assign({}, conf[env] || conf["default"]);

// L'URL MongoDB n'est plus codée en dur : elle vient uniquement de
// variables d'environnement (MONGODB_CONNECTION_STRING ou MONGO_URL),
// éventuellement fournies par un fichier .env (api/.env ou racine).
// webpack n'inline que NODE_ENV, donc ces valeurs sont lues à l'exécution.
if (!process.env.MONGODB_CONNECTION_STRING && !process.env.MONGO_URL) {
  loadDefaultEnv();
}
config.mongooseDB =
  process.env.MONGODB_CONNECTION_STRING || process.env.MONGO_URL || undefined;

module.exports = config;
