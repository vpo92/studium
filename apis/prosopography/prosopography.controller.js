'use strict';
const MongoClient = require("mongodb").MongoClient;
const db = require("../db")

const handleError = (res) => {
  return function(error){
    res.statusCode = 500;
    res.json({"error":error});
  }

}

// Gets a list of Annonces
exports.findAll = function(req, res) {
  console.log("findAll");
    db.get().collection("prosopography").find().toArray()
    .then(function(results){
      console.log(results);
      res.statusCode = 200;
      res.json(results);
    })
    .catch(handleError(res));
};


// Search a list of Annonces
exports.textSearch = function(req, res) {
  console.log("textSearch");
  db.get().collection("prosopography").find({"$text":{"$search":req.params.searchText}}).toArray()
  .then(function(results){
    console.log(results);
    res.statusCode = 200;
    res.json(results);
  })
  .catch(handleError(res));
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
