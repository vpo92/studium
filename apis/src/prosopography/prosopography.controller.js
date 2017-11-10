'use strict';
let MongoClient = require("mongodb").MongoClient;
let util = require("../common/controller.util");
let db = require("../common/db");

// Gets a list of Annonces
exports.findAll = function(req, res) {
  console.log("findAll");
  let lDB = db.get();
  if(lDB){
    db.get().collection("prosopography").find().toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
  }else{
    util.handleError(res)('error retriving connexion to database');
  }
};


// Search a list of Annonces
exports.textSearch = function(req, res) {
  console.log("textSearch");
  let lDB = db.get();
  if(lDB){
    lDB.collection("prosopography").find({"$text":{"$search":req.params.searchText}}).toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
  }else{
    util.handleError(res)('error retriving connexion to database');
  }

};


// Gets a list of Annonces
exports.findByReference = function(req, res) {
  console.log("findByReference reference:"+req.params.reference);
  //db.collection("prosopography").find({"prosop.person.label.usage-name.data":{ $regex : /^A/ ,$options: '-i' }}).toArray(function (error, results) {
  db.get().collection("prosopography").find({"reference":parseInt(req.params.reference)}).toArray()
    .then(function(results){
      console.log(results);
      res.statusCode = 200;
      res.json(results);
    })
    .catch(handleError(res));
};
