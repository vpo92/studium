import db from '../utils/db';
import { processStream } from '../../../batchs/src/rawFilesParser/simpleParser';
import {Readable} from 'stream';

const readPagination = function(pagination){

  if(pagination.rows === -1){
    return {
      "skip" : 0,
      "limit" : 0,
    }
  }

  let page = (pagination && pagination.page?pagination.page:1);
  let rows = (pagination && pagination.rows?pagination.rows:50);

  return {
    "skip" : (page-1)*rows,
    "limit" : rows,
  }

}


async function findAll(pagination){
  const pg = readPagination(pagination);

  return await db
      .get()
      .collection('draft')
      .find()
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray();
}

function findByReference(reference){
  return db
      .get()
      .collection('draft')
      .findOne({ reference: reference });
}
//FIXME TO DO
async function create(prosopography){
  const p = await findByReference(prosopography.reference);
  if(p){
    //throw
    throw "Reference already exists";
  }else{
    return db
        .get()
        .collection('draft')
        .insert(prosopography);
  }
}

async function update(prosopography){
  //FIXME : add controls
  return db
      .get()
      .collection('draft')
      .save(prosopography);
}


async function remove(reference){
  //FIXME : add controls
  return db
      .get()
      .collection('draft')
      .remove({ reference: reference });
}




/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findByReference,
  findAll,
  create,
  update,
  remove,
};
