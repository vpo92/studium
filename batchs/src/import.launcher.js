const fs = require('fs');
const parser = require('./identity.parser');
const MongoClient = require('mongodb').MongoClient
const MongoImporter = require('../src/mongo.importer');

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
    const p = {
      "reference":parser.buildReference(item),
      "identity":parser.buildIdentity(item)
    }
    MongoImporter.importProsopography(db,p)
      .then(function(){
        console.log("Done importing");
      })
      .catch(function(err){
        console.error(err);
      })
    //console.log(p);
    //return p;
};


//const path = "/Users/vincent/Desktop/JSON";
const path = "/Users/vincent/projects/studium/batchs/tests/data/";
//const path = "./tests/data";


MongoClient.connect("mongodb://localhost/studium")
  .then(function(db){
    fs.readdir(path, function(err,files){
      files.map((file) => {
        console.log(file);
        processFile(db,path+"/"+file);
      });
      db.close();
    });
  })
  .catch(function(err){
    console.error(err);
  });
