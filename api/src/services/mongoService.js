
const exec = require('child_process').exec;

const mongoexport = (collection, outputFile) =>
{
  return new Promise((resolve, reject) => {
    let cmd = "mongoexport --db studium --collection "+collection+" --type json --out "+outputFile;
    //let cmd = "/Users/vincent/mongodb-4.2.2/bin/mongoexport --db studium --collection "+collection+" --type json --out "+outputFile;
    try{
      exec(cmd, function (error, stdout, stderr){
        if (error !== null) {
          reject(error);
        }else{
          if(stdout){
            console.log(stdout);
          }
          if(stderr){
            console.log(stderr);
          }
          resolve();
        }
      });
    }catch(error){
      reject(error);
    }
  });
}

const backup = (out) =>
{
  return new Promise((resolve, reject) => {
    let fileName = out+"prosopography.json";
    mongoexport("prosopography",fileName)
    .then( () =>{
      //ZIP
      let d = new Date();
      let zipName =  d.getTime()+"studium.zip";
      let cmd = "zip "+out+""+zipName+" "+fileName;
      console.log(cmd);
      try{
        exec(cmd, function (error, stdout, stderr){
          if (error !== null) {
            reject(error);
          }else{
            if(stdout){
              console.log(stdout);
            }
            if(stderr){
              console.log(stderr);
            }
            resolve();
          }
        });
      }catch(error){
        reject(error);
      }
    });
  });
};


export {
  mongoexport, backup
};
