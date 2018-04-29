// flow

import type { SaveRecordFunction } from './types';

const saveRecordInDatabase: SaveRecordFunction = (record) => {
  console.log(`ref ${record.reference}: Saving record.`);
  return Promise.resolve(record).then((record) => {
    console.log(`ref ${record.reference}: Saved record.`);
  }).catch((e) => { 
    console.log(`ref ${record.reference}: Error saving record : ${e}.`);
  });
}

export {
  saveRecordInDatabase,
};