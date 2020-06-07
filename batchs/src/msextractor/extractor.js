import readline from 'readline';
import fs from 'fs';
import {parseMS} from '../rawFilesParser/util/ms.parser';

export function processStream(stream){
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    try{
      let c = ";";
      console.log("DONNEE"+c+"LIEU"+c+"INSTITUTION"+c+"COTE"+c+"FEUILLET");
      rl.on('line', (line) => {
        try{
          const regex = /^<<c>>[ \t]+(.*)/g
          let t = null;
          if((t =regex.exec(line))){
            let data = t[1];
            if(data.indexOf("/") < 1){
              let raw = {
                data: data,
                place: "",
                placeType: "",
                cote: "",
                page: "",
              };
              let r = parseMS(data);
              if(r!==null){
                raw.place = r.place;
                raw.placeType = r.placeType;
                raw.cote = r.cote;
                raw.page = r.page;
              }
              console.log("\""+raw.data+"\""+c+"\""+raw.place+"\""+c+"\""+raw.placeType+"\""+c+"\""+raw.cote+"\""+c+"\""+raw.page+"\"");
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
