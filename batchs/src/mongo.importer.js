export default {
  importProsopography(db, item) {
    console.log('importProsopography');
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
  },
  createIndex(db) {
    return new Promise((resolve, reject) => {
      if (db) {
        db
          .collection('prosopography')
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
  },
};
