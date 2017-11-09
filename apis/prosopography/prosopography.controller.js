'use strict';
const MongoClient = require("mongodb").MongoClient;

// Gets a list of Annonces
exports.findAll = function(req, res) {
console.log("findAll");

  MongoClient.connect("mongodb://localhost/studium", function(error, db) {
      if (error){
        //res error.
        res.statusCode = 500;
        res.json({"error":error});
      }else{
        db.collection("prosopography").find().toArray(function (error, results) {
            if (error){
              res.statusCode = 500;
              res.json({"error":error});
           }else{
             console.log(results);
             res.statusCode = 200;
             res.json(results);
           }
        });

    }
  });
};


// Gets a list of Annonces
exports.textSearch = function(req, res) {
  console.log("textSearch");

  MongoClient.connect("mongodb://localhost/studium", function(error, db) {
      if (error){
        //res error.
        res.statusCode = 500;
        res.json({"error":error});
      }else{

        //db.articles.find({"source.homeUrl" : { $regex : /^http/ }}).hint({"source.homeUrl" : 1})
        //db.collection("prosopography").find({"prosop.person.label.usage-name.data":{ $regex : /^A/ ,$options: '-i' }}).toArray(function (error, results) {

        db.collection("prosopography").find({"$text":{"$search":req.params.searchText}}).toArray(function (error, results) {
            if (error){
              res.statusCode = 500;
              res.json({"error":error});
           }else{
             console.log(results);
             res.statusCode = 200;
             res.json(results);
           }
        });

    }
  });
};


// Gets a list of Annonces
exports.findByReference = function(req, res) {
  console.log("findByReference reference:"+req.params.reference);

  MongoClient.connect("mongodb://localhost/studium", function(error, db) {
      if (error){
        //res error.
        res.statusCode = 500;
        res.json({"error":error});
      }else{


        //db.collection("prosopography").find({"prosop.person.label.usage-name.data":{ $regex : /^A/ ,$options: '-i' }}).toArray(function (error, results) {
        db.collection("prosopography").find({"reference":req.params.reference}).toArray(function (error, results) {
            if (error){
              res.statusCode = 500;
              res.json({"error":error});
           }else{
             console.log(results);
             res.statusCode = 200;
             res.json(results);
           }
        });

    }
  });
};
