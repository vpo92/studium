// @flow
import {runImportFile } from '../studium.cli.js';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODgyNjE0ODMsImV4cCI6MTU4ODI3NTg4M30.3EgX1YpF2dxU9aW6CyAcowhkEmbQZxHKZbcb9FhZZJM';

//runImportFile('./tests/data/studium_input.txt', apiUrl,token)
runImportFile('./tests/data/studium_input_full.txt', apiUrl,token)
//runImportFile('../data/full_db.txt', apiUrl,token)
//runImportFile('../data/db_full07082019.txt', apiUrl,token)
//runImportFile('../data/20190823_requetefull.txt', apiUrl,token)
//runImportFile('../data/missing.txt', apiUrl,token)
