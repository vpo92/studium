const fs = require('fs');
const parser = require('./identity.parser');

const readXMLFile = (fileName) => {
  return fs.readFileSync(fileName,'utf-8');
}

const convertStringToJSON = (json) => {
  return JSON.parse(json);
};

const handleErrors = (error) => {
  console.error(error);
}

const processFile = (fileName) => {
    let item = convertStringToJSON(readXMLFile(fileName));
    const p = {
      "reference":parser.buildReference(item),
      "identity":parser.buildIdentity(item)
    }
    console.log(p);
};


//var path = "/Users/vincent/Desktop/JSON";
const path = "./tests/data";

fs.readdir(path, function(err,files){
  files.map((file) => {
    console.log(file);
    processFile(path+"/"+file);
  });
});
