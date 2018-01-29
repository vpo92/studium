//Express
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

const db = require('./src/common/db');
const logger = require('./src/common/logger');

//Conf
//const config = require('./config');

let app = express();

app.set('env', process.env.NODE_ENV || "dev");
//app.set('port', config.port);
app.set('port', 3000);

//for cross domain
app.use(cors());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//var routes = require('./routes');
require('./routes')(app);

let server_port = app.get('port');
let server_ip_address = '0.0.0.0';

db.connect('mongodb://localhost:27017/studium', function(err) {
  if (err) {
    logger.error(err);
    process.exit(1)
  } else {
    app.listen(server_port,server_ip_address, function(){
      logger.info("process.env.NODE_ENV:"+process.env.NODE_ENV+":");
      logger.info( "studium-api listening on " + server_ip_address + ", server_port " + server_port )
    });
  }
})
