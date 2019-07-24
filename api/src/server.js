// @flow

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';

import routes from './routes/routes';
import db from './utils/db';
import logger from './utils/logger';

import mongoose from 'mongoose';

import config from '../config';

logger.info('starting application');
const environment = process.env.NODE_ENV || '';

logger.info(`using environment : ${environment}`);
logger.info('using config :');
logger.info(JSON.stringify(config));

const mongoUrl = process.env.MONGODB_CONNECTION_STRING || config.mongooseDB;
logger.info(`mongoUrl : ${mongoUrl}`);
mongoose.connect(mongoUrl,{ useNewUrlParser: true });

const app = express();

app.set('env', environment);
app.set('port', 3000);

app.use(cors());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);
app.use(errorHandler);

const server_port = app.get('port');
const server_ip_address = '0.0.0.0';

logger.info('runnning server on '+server_port);

if (!config.mongooseDB) {
  throw new Error('Could not initialize server : unknown mongo url.');
}

db.connect(config.mongooseDB, err => {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    app.listen(server_port, server_ip_address, function() {
      logger.info(`NODE_ENV: ${environment}`);
      logger.info(
        'studium-api listening on ' +
          server_ip_address +
          ', server_port ' +
          server_port
      );
    });
  }
});

// eslint-disable-next-line
function errorHandler(err, req, res, next) {
  res.status(500).send({ error: err.message });
}
