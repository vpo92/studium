import fs from 'fs';
import parser from './identity.parser';
import OriginParser from './origin.parser';
import RelationalParser from './relational.parser';
import { MongoClient } from 'mongodb';
import MongoImporter from '../src/mongo.importer';
import OmitEmpty from 'omit-empty';

const enableMongo = false;

const path = './tests/data';

let errors = [];

const readXMLFile = fileName => {
  return fs.readFileSync(fileName, 'utf-8');
};

const convertStringToJSON = json => {
  return JSON.parse(json);
};

const handleErrors = error => {
  console.error(error);
};

const processFile = (db, fileName) => {
  let item = convertStringToJSON(readXMLFile(fileName));
  try {
    const p = {
      reference: parser.buildReference(item),
      identity: parser.buildIdentity(item),
      origin: OriginParser.buildOrigin(item),
      relationalInsertion: RelationalParser.buildRelationalInsertion(item),
    };
    let prosopography = OmitEmpty(p);
    if (enableMongo) {
      MongoImporter.importProsopography(db, prosopography)
        .then(() => {
          console.log('Done importing');
        })
        .catch(err => {
          console.error(err);
        });
    }
  } catch (e) {
    console.error(e);
    errors.push(fileName, e);
  }
};

const doImport = db => {
  fs.readdir(path, (err, files) => {
    files.map(file => {
      processFile(db, `${path}/${file}`);
    });
    console.log(`Nb errors:${errors.length}`);
    console.log(errors);
    if (enableMongo) {
      MongoImporter.createIndex(db).then(db.close());
    }
  });
};

if (enableMongo) {
  MongoClient.connect('mongodb://localhost/studium')
    .then(doImport)
    .catch(err => {
      console.error(err);
    });
} else {
  doImport();
}
