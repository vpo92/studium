// @flow

import { processFile } from './extractor';

//processFile('./tests/data/simple_studium_input.txt', saveFunction)
//processFile('./tests/data/487.txt', saveFunction)
//processFile('./tests/data/studium_input.txt', saveFunction)
//processFile('./tests/data/studium_input_full.txt', saveFunction)
processFile('../data/full_db.txt')
.then(function(){
  //console.log("EXTRACT DONE");
})
.catch(function(err){
  console.error(err);
});
