//@flow
import type { SaveRecordFunction } from './types';
import { MongoClient } from 'mongodb';

const exec = require('child_process').exec;
//const util = require('util');
//const exec = util.promisify(require('child_process').exec);

function importRecord(db,item){
  return new Promise((resolve, reject) => {
    if (db && item) {
      db.collection('prosopography').insertOne(item, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve({"db":db,"record":results});
        }
      });
    } else {
      console.log('rejection');
      reject('missing params');
    }
  });
}



/**
const saveRecordInDatabaseOld: SaveRecordFunction = (record) => {
  console.log(`ref ${record.reference}: Saving record.`);
  return Promise.resolve(record).then((record) => {
    console.log(`ref ${record.reference}: Saved record.`);
  }).catch((e) => {
    console.log(`ref ${record.reference}: Error saving record : ${e}.`);
  });
}*/
//FIXME : batch never stop...
const saveRecordInDatabase: SaveRecordFunction = (record) => {
  console.log(`ref ${record.reference}: Saving record.`);
  return MongoClient.connect('mongodb://localhost/studium')
  .then(function(db){
    importRecord(db,record)
    .then( function(res){
        //console.log("SAVE OK for "+record.reference);
        res.db.close();
      }
    );
  })
  .catch((e) => {
    console.log(`ref ${record.reference}: Error saving record : ${e}.`);
  });
};

const createIndex = () => {
  console.log(`create index`);

  return MongoClient.connect('mongodb://localhost/studium')
  .then(function(db){
    return new Promise((resolve, reject) => {
      if (db) {
        db.collection('prosopography')
          .createIndex({ '$**': 'text' },{ language_override: "dummy" }, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(db);
            }
          });
        } else {
          console.log('rejection');
          reject('missing params');
        }
      });
  })
  .catch((e) => {
    console.log(`Error creating index : ${e}.`);
  });

};

const mongoexport = (collection, outputFile) =>
{
  return new Promise((resolve, reject) => {
    let cmd = "mongoexport --db studium --collection "+collection+" --type json --out "+outputFile;
    //let cmd = "/Users/vincent/mongodb-4.2.2/bin/mongoexport --db studium --collection "+collection+" --type json --out "+outputFile;
    try{
      exec(cmd, function (error, stdout, stderr){
        if (error !== null) {
          reject(error);
        }else{
          if(stdout){
            console.log(stdout);
          }
          if(stderr){
            console.log(stderr);
          }
          resolve();
        }
      });
    }catch(error){
      reject(error);
    };
  });
}

const backup = (out: string) =>
{
  return new Promise((resolve, reject) => {
    let fileName = out+"prosopography.json";
    mongoexport("prosopography",fileName)
    .then( () =>{
      //ZIP
      let d = new Date();
      let zipName =  d.getTime()+"studium.zip";
      let cmd = "zip "+out+""+zipName+" "+fileName;
      console.log(cmd);
      try{
        exec(cmd, function (error, stdout, stderr){
          if (error !== null) {
            reject(error);
          }else{
            if(stdout){
              console.log(stdout);
            }
            if(stderr){
              console.log(stderr);
            }
            resolve();
          }
        });
      }catch(error){
        reject(error);
      };
    });
  });
};


export {
  saveRecordInDatabase, createIndex, mongoexport, backup
};
