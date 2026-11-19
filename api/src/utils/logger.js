// @flow

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
const config = require('../../config');
require('winston-mongodb');

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(),prettyPrint()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console({ prettyPrint: true, showLevel: 'debug', 'timestamp':true }),
    new transports.MongoDB({
      prettyPrint: true,
      showLevel: 'debug',
      timestamp:true,
      db : process.env.MONGODB_CONNECTION_STRING || (config.mongooseDB ||'mongodb://localhost:27017/studium'),
      collection : 'logs',
      level : 'debug',
      capped : true
     })
  ],
});


/**
const logger = new winston.Logger({
  level: 'info',
  transports,
});
*/
module.exports = logger;
