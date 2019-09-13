// @flow

import { processFile } from './parser';
import { saveRecord, createIndex } from './RestService';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1NjgzNjM0NzQsImV4cCI6MTU2ODM3Nzg3NH0.1tRQyD4lhP_Y3C3SMjChd8uq5pd1DCLyDqPGJpmtZ8E';

let localSaveRecord = (record) => {
  return saveRecord(apiUrl, token, record);
};
let localCreateIndex = () => {
  return createIndex(apiUrl, token);
};

//Run import
//processFile('./tests/data/studium_input.txt', localSaveRecord)
//processFile('./tests/data/studium_input_full.txt', localSaveRecord)
//processFile('../data/full_db.txt', localSaveRecord)
//processFile('../data/db_full07082019.txt', localSaveRecord)
//processFile('../data/20190823_requetefull.txt', localSaveRecord)
processFile('../data/missing.txt', localSaveRecord)
  .then(function(){
    localCreateIndex()
  })
  .catch(function(err){
    console.error(err);
  });
