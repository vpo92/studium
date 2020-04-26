// @flow

//import { processFile } from './parser';
import { processFile } from './simpleParser';
import { saveRecordInDatabase, createIndex } from './mongoService';

//FIXME : add index in mongo for full text search


processFile('./tests/data/simple_studium_input.txt', saveRecordInDatabase)
//processFile('./tests/data/487.txt', saveRecordInDatabase)
//processFile('./tests/data/studium_input.txt', saveRecordInDatabase)
//processFile('./tests/data/studium_input_full.txt', saveRecordInDatabase)
//processFile('../data/full_db.txt', saveRecordInDatabase)

.then(function(){
  createIndex()
  .then(function(db){
      db.close();
  });
})
.catch(function(err){
  console.error(err);
});
