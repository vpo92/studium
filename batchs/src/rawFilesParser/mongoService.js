// @flow

import type { SaveRecordFunction } from './types';
import { MongoClient } from 'mongodb';


function importRecord(db,item){
  return new Promise((resolve, reject) => {
    if (db && item) {
      db.collection('prosopography').insert(item, null, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
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
        console.log("SAVE OK for"+res._id);
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
          .createIndex({ '$**': 'text' }, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        } else {
          console.log('rejection');
          reject('missing params');
        }
      });
  })
  .catch((e) => {
    console.log(`ref ${record.reference}: Error saving record : ${e}.`);
  });

};

export {
  saveRecordInDatabase,createIndex
};
