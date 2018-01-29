'use strict';

const prosopography = require('./src/prosopography');

module.exports = function(app) {
  // Insert routes below
  app.use('/prosopography', prosopography);

};
