'use strict';
let util = require("../common/controller.util");
let db = require("../common/db");
const logger = require('../common/logger');

// Gets a list of Annonces
exports.findAll = function(req, res) {
  logger.info("findAll");
  let lDB = db.get();
  if(lDB){
    db.get().collection("prosopography").find().limit(50).toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
  }else{
    util.handleError(res)('error retriving connexion to database');
  }
};


// Search a list of Annonces
exports.textSearch = function(req, res) {
  logger.info("textSearch");
  let lDB = db.get();
  if(lDB){
    lDB.collection("prosopography").find({"$text":{"$search":req.params.searchText}},{score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}}).limit(50).toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
  }else{
    util.handleError(res)('error retriving connexion to database');
  }
};


// Retrieve a list of prosopography by letter
exports.indexSearch = function(req, res) {
  logger.info("indexSearch");
  const letter = req.params.letter;
  const regex = new RegExp(`^${letter}`,"g");
  let lDB = db.get();
  if(lDB){
    lDB.collection("prosopography").find({"identity.name.value":{ $regex : regex ,$options: '-i' }}).limit(0).toArray()
    //lDB.collection("prosopography").find().limit(50).toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
  }else{
    util.handleError(res)('error retriving connexion to database');
  }
};


// Gets a list of Annonces
exports.findByReference = function(req, res) {
  logger.info("findByReference reference:"+req.params.reference);
  //db.collection("prosopography").find({"prosop.person.label.usage-name.data":{ $regex : /^A/ ,$options: '-i' }}).toArray(function (error, results) {
  db.get().collection("prosopography").findOne({"reference":parseInt(req.params.reference)})
    .then(function(results){
      logger.info(results);
      res.statusCode = 200;
      res.json(results);
    })
    .catch(util.handleError(res));
};
