// @flow

import { processFile } from './parser';
import { saveRecord, createIndex } from './RestService';

let apiUrl = 'http://studium-api.vincentpoupet.fr';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpbmNlbnQucG91cGV0QGdtYWlsLmNvbSIsImlhdCI6MTU1MjY2MDI0OSwiZXhwIjoxNTUyNjYwMzY5fQ.7wFI5GnCuymIBtQoSrJQeE8ghBs1JaFPPjnYeLFxgLQ';

let localSaveRecord = (record) => {
  return saveRecord(apiUrl, token, record);
};
let localCreateIndex = () => {
  return createIndex(apiUrl, token);
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
