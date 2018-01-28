'use strict';

module.exports = function(app) {
  // Insert routes below
  app.use('/prosopography', require('./src/prosopography'));
};
