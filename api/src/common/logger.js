import winston from 'winston';

let transports = [
  new winston.transports.File({
    name: 'ERROR-FILE',
    filename: 'api-error.log',
    level: 'error',
  }),
  new winston.transports.File({
    name: 'ALL-FILE',
    filename: 'api-combined.log',
  }),
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({ prettyPrint: true, showLevel: 'debug' })
  );
}

const logger = new winston.Logger({
  level: 'info',
  transports: transports,
});

module.exports = logger;
