// @flow

import winston from 'winston';

let transports = [
  new winston.transports.File({
    name: 'ERROR-FILE',
    filename: '/var/log/studim-api-error.log',
    level: 'error',
  }),
  new winston.transports.File({
    name: 'ALL-FILE',
    filename: '/var/log/studium-combined.log',
  }),
  new winston.transports.Console({ prettyPrint: true, showLevel: 'debug' }),
];

const logger = new winston.Logger({
  level: 'info',
  transports: transports,
});

module.exports = logger;
