// @flow

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const config = require('../../config');
require('winston-mongodb');

// L'URL Mongo vient des variables d'environnement (voir api/config) ;
// le transport MongoDB n'est ajouté que si une URL est configurée.
const mongoUrl = process.env.MONGODB_CONNECTION_STRING || process.env.MONGO_URL || config.mongooseDB;
const logTransports = [
  new transports.Console({ prettyPrint: true, showLevel: 'debug', 'timestamp':true }),
];
if (mongoUrl) {
  logTransports.push(
    new transports.MongoDB({
      prettyPrint: true,
      showLevel: 'debug',
      timestamp:true,
      db : mongoUrl,
      collection : 'logs',
      level : 'debug',
      capped : true
    })
  );
}

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(),prettyPrint()),
  defaultMeta: { service: 'user-service' },
  transports: logTransports,
});


/**
const logger = new winston.Logger({
  level: 'info',
  transports,
});
*/
module.exports = logger;
