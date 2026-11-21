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

const mongoUrl = process.env.MONGODB_CONNECTION_STRING || process.env.MONGO_URL || config.mongooseDB;
if (!mongoUrl) {
  throw new Error('Could not initialize server : MONGODB_CONNECTION_STRING (ou MONGO_URL) manquant.');
}
logger.info(`mongoUrl : ${mongoUrl}`);
mongoose.connect(mongoUrl,{ useNewUrlParser: true });

const app = express();


const logMiddle = function(request, response, next) {
  logger.info(request.method+" "+request.path);
  next();
}

// Les parsers globaux ne doivent jamais consommer le corps des uploads
// d'archives (POST /admin/jobs/backups) : la route le lit en flux brut.
// Sans cette garde, une archive envoyée en « formulaire » déclenchait une
// erreur de parsing (« request entity too large » / « too many parameters »)
// renvoyée en 500 sans message exploitable (ticket #10).
function isRawArchiveUpload(req) {
  return req.method === 'POST' && /\/admin\/jobs\/backups\/?$/.test(req.path || '');
}
function parseJson(req) {
  return !isRawArchiveUpload(req)
    && /application\/json/i.test(String(req.headers['content-type'] || ''));
}
function parseForm(req) {
  return !isRawArchiveUpload(req)
    && /x-www-form-urlencoded/i.test(String(req.headers['content-type'] || ''));
}

app.set('env', environment);
app.set('port', 3000);
app.use(logMiddle);
app.use(cors());
app.use(methodOverride());
app.use(bodyParser.json({ limit: '50mb', type: parseJson }));
app.use(bodyParser.text());
// Même plafond que le JSON : sans lui, toute requête urlencoded > 100 ko —
// notamment les tentatives d'upload d'archive envoyées en formulaire —
// partait en erreur « request entity too large » remontée en 500 (ticket #10).
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', type: parseForm }));
app.use('/', routes);
app.use(errorHandler);


const server_port = app.get('port');
const server_ip_address = '0.0.0.0';

logger.info('runnning server on '+server_port);

if (!config.mongooseDB) {
  throw new Error('Could not initialize server : unknown mongo url.');
}

db.connect(mongoUrl, err => {
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
  // Ticket #10 : tout renvoyait un 500 muet au format {error}, incompréhensible
  // pour l'IHM qui lit {message}. On propage le code réel (413 des parsers,
  // 400 des validations, etc.), on journalise la cause, et on répond dans le
  // format attendu côté client (message) en gardant `error` par compatibilité.
  const status = err && (err.status || err.statusCode) ? (err.status || err.statusCode) : 500;
  const message = (err && err.message) ? err.message : 'Erreur interne du serveur.';
  logger.error(`${req.method} ${req.originalUrl || req.path} -> ${status}: ${message}`);
  res.status(status).json({ message: message, error: message });
}
