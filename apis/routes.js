'use strict';

const path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/prosopography', require('./src/prosopography'));

};
