import { getAllIds, reIndex } from './RestService';

let apiUrl = 'http://localhost:3000';
//let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODgxMDIzNTAsImV4cCI6MTU4ODExNjc1MH0.WRcDKNrTvxoqwBWz7uS5nCYMK9Z0rlh_Llmw4YhCaxE';

getAllIds(apiUrl,token)
.then((ids) => {
  ids.forEach((id) => {
      reIndex(apiUrl,token,id)
      .catch((error) => {
        console.log(error)
      });
  });

  })
.catch( (error) => {
  console.log("ERROR");
  console.log(error);
});
