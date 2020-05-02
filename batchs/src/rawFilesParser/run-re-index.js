import { runReIndex } from '../studium.cli.js';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODg0MDU3NjIsImV4cCI6MTU4ODQyMDE2Mn0.7YDUYNg-cvuTrtQVnS1o7ksSsznkjlvIz6NvHq_Zvgo';

runReIndex(apiUrl,token);
