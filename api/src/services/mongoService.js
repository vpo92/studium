import db from '../utils/db';

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
/** *********************
 * Export               *
 ************************
 */
module.exports = {
  executeQuery
};
