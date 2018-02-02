const fs = require('fs');
const parser = require('./identity.parser');
const OriginParser = require('./origin.parser');
const RelationalParser = require('./relational.parser');
const MongoClient = require('mongodb').MongoClient
const MongoImporter = require('../src/mongo.importer');

const enableMongo = false;

//const path = "/Users/vincent/Desktop/JSON";
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
        "origin":OriginParser.buildOrigin(item),
        "relationalInsertion":RelationalParser.buildRelationalInsertion(item),
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

const doImport = db => {
  fs.readdir(path, function(err,files){
    files.map((file) => {
      processFile(db,path+"/"+file);
    });
    console.log("Nb errors:"+errors.length);
    console.log(errors);
    if(enableMongo){
      MongoImporter.createIndex(db)
        .then(db.close());
    }
  });
};

if(enableMongo){
  MongoClient.connect("mongodb://localhost/studium")
    .then(doImport)
    .catch(function(err){
      console.error(err);
    });
}else{
  //FIXME trycatch
  doImport();
}

/**
MongoClient.connect("mongodb://localhost/studium")
  .then(function(db){
    fs.readdir(path, function(err,files){
      files.map((file) => {
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
*/


/*priorité :
3 relationelInsertion
5b -> universite frequente, nation
5e ->
7b  -> universite d'enseignement
20 -> 60 oeuvre / production textuel
6b/6d -> carriere eclisiaticeu
*/
