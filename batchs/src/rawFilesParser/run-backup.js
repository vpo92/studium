import { backupAll } from './RestService';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODgxNzE2NzQsImV4cCI6MTU4ODE4NjA3NH0.2oq7iq9kq_wxKL84G7_87nRzWBQXkNQWxZufsf5KyjI';

backupAll(apiUrl,token)
.then((msg) => {console.log(msg)})
.catch( (error) => {
  console.log("ERROR");
  console.log(error);
});
