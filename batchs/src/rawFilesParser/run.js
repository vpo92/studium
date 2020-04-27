// @flow

//import { processFile } from './parser';
import { processFile } from './simpleParser';
import { saveRecordInDatabase, createIndex } from './mongoService';

//FIXME : add index in mongo for full text search


let localSaveRecord = (record) => {
  return new Promise((resolve, reject) => {
    console.log(record);
    resolve();
    });
};
let localCreateIndex = () => {
  return new Promise((resolve, reject) => {
    console.log("create index");
    let db = {close : function(){} };
    resolve(db);
    });
};


//let saveFunction =  localSaveRecord;
//let indexFunction = localCreateIndex;
let saveFunction = saveRecordInDatabase;
let indexFunction = createIndex;

//processFile('./tests/data/simple_studium_input.txt', saveFunction)
//processFile('./tests/data/487.txt', saveFunction)
//processFile('./tests/data/studium_input.txt', saveFunction)
//processFile('./tests/data/studium_input_full.txt', saveFunction)
processFile('../data/full_db.txt', saveFunction)

.then(function(){
  indexFunction()
  .then(function(db){
    if(db)
      db.close();
  });
})
.catch(function(err){
  console.error(err);
});
