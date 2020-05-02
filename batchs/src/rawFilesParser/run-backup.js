import { runBackupAll } from '../studium.cli.js';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODgyNTkyOTIsImV4cCI6MTU4ODI3MzY5Mn0.LP3UAnHKOtQRaQj_gqnLnchPyGGhOO9URV8ubd52kVI';

runBackupAll(apiUrl,token);
