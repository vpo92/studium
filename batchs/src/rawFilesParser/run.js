// @flow

import { processFile } from './parser';
import { saveRecordInDatabase, createIndex } from './mongoService';

//FIXME : add index in mongo for full text search

processFile('./tests/data/studium_input.txt', saveRecordInDatabase)
.then(
  createIndex()
);