import fs from 'fs';
import { MongoClient } from 'mongodb';



const importJSON = (db,collection,json) => {
  db.collection(collection).insert(json, function(err, result) {
      if(err) {
        throw err;
      }else {
        process.exit()
      }
  });
}

const saveFileInDatabase = (collection,json) => {
  console.log(`saveFileInDatabase collection : ${collection}`);

  MongoClient.connect('mongodb://localhost/studium')
  .then(function(db){
    importJSON(db,collection,json);
  })
  .catch((e) => {
    console.log(`saveFileInDatabase : Error saving file : ${e}.`);
  });
};

const file = process.argv[2];
const collection = process.argv[3];
console.log(`csvImporter will process file ${file} in collection ${collection}`);

fs.readFile(file, 'utf8', (err, data) => {
  if (err) {
    throw err;
  }else{
    //console.log(data);
    const json = JSON.parse(data);
    saveFileInDatabase(collection,json);
  }
} );
