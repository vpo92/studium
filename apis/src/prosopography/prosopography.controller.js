'use strict';
let util = require('../common/controller.util');
let db = require('../common/db');

// Gets a list of Annonces
function findAll(req, res) {
  console.log('findAll');
  let lDB = db.get();
  if (lDB) {
    db
      .get()
      .collection('prosopography')
      .find()
      .limit(50)
      .toArray()
      .then(util.handleData(res))
      .catch(util.handleError(res));
  } else {
    util.handleError(res)('error retriving connexion to database');
  }
}

// Search a list of Annonces
function textSearch(req, res) {
  console.log('textSearch');
  let lDB = db.get();
  if (lDB) {
    lDB
      .collection('prosopography')
      .find(
        { $text: { $search: req.params.searchText } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .toArray()
      .then(util.handleData(res))
      .catch(util.handleError(res));
  } else {
    util.handleError(res)('error retriving connexion to database');
  }
}

// Retrieve a list of prosopography by letter
function indexSearch(req, res) {
  console.log('indexSearch');
  const letter = req.params.letter;
  const regex = new RegExp(`^${letter}`, 'g');
  let lDB = db.get();
  if (lDB) {
    lDB
      .collection('prosopography')
      .find({ 'identity.name.value': { $regex: regex, $options: '-i' } })
      .limit(0)
      .toArray()
      //lDB.collection("prosopography").find().limit(50).toArray()
      .then(util.handleData(res))
      .catch(util.handleError(res));
  } else {
    util.handleError(res)('error retriving connexion to database');
  }
}

// Gets a list of Annonces
function findByReference(req, res) {
  console.log('findByReference reference:' + req.params.reference);
  db
    .get()
    .collection('prosopography')
    .findOne({ reference: parseInt(req.params.reference) })
    .then(function(results) {
      console.log(results);
      res.statusCode = 200;
      res.json(results);
    })
    .catch(util.handleError(res));
}

module.exports = {
  findAll,
  indexSearch,
  findByReference,
  textSearch,
};
