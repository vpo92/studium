const conf = require("./config.json");
const env = process.env.NODE_ENV || "dev";
const config = Object.assign({}, conf[env] || conf["default"]);

// Allow the runtime (Docker, systemd, ...) to override the Mongo URL.
// webpack only inlines NODE_ENV, so this value is still read at runtime.
if (process.env.MONGODB_CONNECTION_STRING) {
  config.mongooseDB = process.env.MONGODB_CONNECTION_STRING;
}

module.exports = config;
