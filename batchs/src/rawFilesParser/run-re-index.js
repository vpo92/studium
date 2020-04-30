import { getAllIds, reIndex } from './RestService';

//let apiUrl = 'http://localhost:3000';
let apiUrl = 'http://studium.univ-paris1.fr/api/';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0ZXBoYW5lLmxhbWFzc2VAdW5pdi1wYXJpczEuZnIiLCJpYXQiOjE1ODgyNDk1MTAsImV4cCI6MTU4ODI2MzkxMH0.mqM5R1IbAhyilAQ1A-TQ2GnID0AOkK2VBO_e-TiqKwE';


function recurviceReIndex(ids){
  //console.log("recurviceReIndex size: "+ids.length);
  if(ids && ids.length > 0){
    reIndex(apiUrl,token,ids[0])
    .then(() => {
      recurviceReIndex(ids.slice(1));
    })
    .catch((error) => {
      console.log(error)
    });
  }
}


getAllIds(apiUrl,token)
.then((ids) => {
  recurviceReIndex(ids);
})
.catch( (error) => {
  console.log("ERROR");
  console.log(error);
});

/**
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
*/
