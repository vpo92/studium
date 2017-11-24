const fs = require('fs');
const parser = require('./identity.parser');
const MongoClient = require('mongodb').MongoClient
const MongoImporter = require('../src/mongo.importer');

const enableMongo = false;

//const path = "/Users/vincent/Desktop/JSON";
//const path = "/Users/vincent/projects/studium/batchs/tests/data/";
const path = "./batchs/tests/data";

let errors = [];

const readXMLFile = (fileName) => {
  return fs.readFileSync(fileName,'utf-8');
}

const convertStringToJSON = (json) => {
  return JSON.parse(json);
};

const handleErrors = (error) => {
  console.error(error);
}

const processFile = (db,fileName) => {
    let item = convertStringToJSON(readXMLFile(fileName));
    try{
      const p = {
        "reference":parser.buildReference(item),
        "identity":parser.buildIdentity(item),
      }
      if(enableMongo){
        MongoImporter.importProsopography(db,p)
          .then(function(){
            console.log("Done importing");
          })
          .catch(function(err){
            console.error(err);
          })
      }
  }catch(e){
    console.error(e);
    errors.push(fileName,e);
  }
};

MongoClient.connect("mongodb://localhost/studium")
  .then(function(db){
    fs.readdir(path, function(err,files){
      files.map((file) => {
        console.log(file);
        processFile(db,path+"/"+file);
      });
      console.log("Nb errors:"+errors.length);
      console.log(errors);
      if(enableMongo){
        MongoImporter.createIndex(db)
          .then(db.close());
      }else {
        db.close();
      }
    });
  })
  .catch(function(err){
    console.error(err);
  });
