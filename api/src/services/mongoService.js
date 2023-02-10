import db from '../utils/db';
import util from 'util';
const exec = util.promisify(require('child_process').exec);

const fs = require('fs');

async function executeQuery(collection,find,projection,skip,limit){
  if(!collection){
    throw "collection is not set";
  }
  if(!find){
    find = {};
  }
  if(!projection){
    projection = {};
  }
  var r = db
        .get()
        .collection(collection)
        .find(find,projection);
  if(skip){
    r = r.skip(skip);
  }
  if(limit){
    r = r.limit(limit);
  }
  return r.toArray();
}

async function dumpStudium(connectionString, filename){
  if(!filename){
    throw "filename is not set";
  }
  let outName = filename+"/studium-"+Date.now()+".bkp";
  const { stdout, stderr } = await exec('mongodump --uri="'+connectionString+'"  --archive="'+outName+'"');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);

  return;

}


async function listDump(dir){

  var res = [];
  const files = fs.readdirSync(dir);
  for (const file of files){
    res.push({"name": file});
  }
  return res;
}


/** *********************
 * Export               *
 ************************
 */
module.exports = {
  executeQuery,
  dumpStudium,
  listDump
};
