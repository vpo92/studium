import readline from 'readline';
import fs from 'fs';
import {detectPlaces} from '../rawFilesParser/util/place.parser';
var removeAccents = require('remove-accents');

export function processStream(stream){
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    try{
      let id = 1;
      let c = ";";
      let gPlaces = [];
      console.log("ID"+c+"LIEU"+c+"LIEU_NORMALISE");
      rl.on('line', (line) => {
        try{
          //console.log(line);
          let places = detectPlaces(line);
          if(places){
            for(let i = 0; i < places.length; i++){
              if(!gPlaces[places[i]]){
                gPlaces[places[i]] = 1;
                let upper = removeAccents(places[i]).toUpperCase();
                console.log(id+c+places[i]+c+upper);
                id++;
              }

            }
          }


        }catch(e){
          console.log("ERROR READING LINE ");
        }
      });

      rl.on('close', () => {
        try{
          //console.log("]")
        }catch(e){
          console.log("ERROR CLOSING FILE ");
        }
        resolve();
      });

    }catch(e){
      console.log("ERROR READING FILE");
      reject(e);
    }
  });
}

export async function processFile(inputFile){
  const instream = fs.createReadStream(inputFile);
  return processStream(instream);
}
