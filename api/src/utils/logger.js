// @flow

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const config = require('../../config');
require('winston-mongodb');

const transports = [
  new transports.Console({ prettyPrint: true, showLevel: 'debug', 'timestamp':true }),
];

// L'URL Mongo vient des variables d'environnement (voir api/config) ;
// le transport MongoDB n'est ajouté que si une URL est configurée.
const mongoUrl = process.env.MONGODB_CONNECTION_STRING || process.env.MONGO_URL || config.mongooseDB;
if (mongoUrl) {
  transports.push(
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
  transports,
});


/**
const logger = new winston.Logger({
  level: 'info',
  transports,
});
*/
module.exports = logger;
