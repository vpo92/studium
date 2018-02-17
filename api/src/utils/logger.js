// @flow

import winston from 'winston';

let transports = [
  new winston.transports.Console({ prettyPrint: true, showLevel: 'debug' }),
];

const logger = new winston.Logger({
  level: 'info',
  transports: transports,
});

module.exports = logger;
