import db from '../utils/db';
import util from 'util';
const exec = util.promisify(require('child_process').exec);

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

  try {
      const { stdout, stderr } = await exec('mongodump --uri="'+connectionString+'');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
  }catch (err){
      console.error(err);
      throw "error in export";
  };
  return;

}


/** *********************
 * Export               *
 ************************
 */
module.exports = {
  executeQuery,
  dumpStudium
};
