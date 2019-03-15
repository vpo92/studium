const conf = require("./config.json");
const env = process.env.NODE_ENV || "dev";
const config = conf[env] || conf["default"];
module.exports = config;
