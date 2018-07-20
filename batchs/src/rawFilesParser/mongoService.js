// flow

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
  return MongoClient.connect('mongodb://localhost/studium2')
  .then(function(db){
    importRecord(db,record) ;
  })
  .catch((e) => {
    console.log(`ref ${record.reference}: Error saving record : ${e}.`);
  });
}

export {
  saveRecordInDatabase,
};
