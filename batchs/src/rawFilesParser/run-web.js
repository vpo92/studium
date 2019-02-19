// @flow

import { processFile } from './parser';
import { saveRecord, createIndex } from './RestService';


let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpbmNlbnQucG91cGV0QGdtYWlsLmNvbSIsImlhdCI6MTU1MDYwMDI4MSwiZXhwIjoxNTUwNjAwNDAxfQ.f5uqdF1E0DfDMm5iODL6q--W1lCd-x-etKa263bgXTQ';
let localSaveRecord = (record) => {
  return saveRecord("http://localhost:3000", token, record);
};
let localCreateIndex = () => {
  return createIndex("http://localhost:3000", token);
};

//Run import
processFile('./tests/data/studium_input.txt', localSaveRecord)
//processFile('./tests/data/studium_input_full.txt', localSaveRecord)
//processFile('../data/full_db.txt', localSaveRecord)
  .then(function(){
    localCreateIndex()
  })
  .catch(function(err){
    console.error(err);
  });
