const fs = require('fs');
const parser = require('./identity.parser');

var readXMLFile = (fileName) => {
  return fs.readFileSync(fileName,'utf-8');
}

var convertStringToJSON = (json) => {
  return JSON.parse(json);
};

var handleErrors = (error) => {
  console.error(error);
}

var processFile = (fileName) => {
    var item = convertStringToJSON(readXMLFile(fileName));
    var p = {
      "reference":parser.buildReference(item),
      "identity":parser.buildIdentity(item)
    }
    console.log(p);
};


//var path = "/Users/vincent/Desktop/JSON";
var path = "./tests/data";

fs.readdir(path, function(err,files){
  files.map((file) => {
    console.log(file);
    processFile(path+"/"+file);
  });
});
