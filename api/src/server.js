import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';

import routes from './routes/routes';
import db from './common/db';
import logger from './common/logger';

const app = express();

app.set('env', process.env.NODE_ENV || 'dev');
app.set('port', 3000);

app.use(cors());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);

let server_port = app.get('port');
let server_ip_address = '0.0.0.0';

db.connect('mongodb://localhost:27017/studium', function(err) {
  if (err) {
    logger.error(err);
    process.exit(1);
  } else {
    app.listen(server_port, server_ip_address, function() {
      logger.info('process.env.NODE_ENV:' + process.env.NODE_ENV + ':');
      logger.info(
        'studium-api listening on ' +
          server_ip_address +
          ', server_port ' +
          server_port
      );
    });
  }
});
