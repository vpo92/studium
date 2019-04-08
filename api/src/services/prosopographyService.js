// @flow

import db from '../utils/db';
//import { type Prosopography } from '../../types/Prosopography';
import { type Prosopography } from '../../../batchs/src/rawFilesParser/types';
import { type SearchRequest } from '../../types/SearchRequest';
import { processStream } from '../../../batchs/src/rawFilesParser/parser';
import {Readable} from 'stream';

async function findAll(): Promise<Prosopography[]> {
  return await db
    .get()
    .collection('prosopography')
    .find()
    .limit(50)
    .toArray();
}

async function textSearch(searchText: string): Promise<Prosopography[]> {
  return await db
    .get()
    .collection('prosopography')
    .find(
      { $text: { $search: searchText } },
      { score: { $meta: 'textScore' }, reference: true, identity: true }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(50)
    .toArray();
}

function indexSearch(letter: string): Promise<Prosopography[]> {
  const regex = new RegExp(`^${letter}`, 'g');
  return db
    .get()
    .collection('prosopography')
    .find(
      { 'identity.name.value': { $regex: regex, $options: '-i' } },
      { reference: true, identity: true }
    )
    .limit(0)
    .toArray();
}

function findByReference(reference: string): Promise<Prosopography> {
  return db
    .get()
    .collection('prosopography')
    .findOne({ reference: reference });
}

function indexDB(){
  console.log(`create index`);
    return db
    .get()
    .collection('prosopography')
    .createIndex({ '$**': 'text' });
}

async function create(prosopography: Prosopography): Promise<Any> {
  //FIXME : add controls
  return db
    .get()
    .collection('prosopography')
    .insert(prosopography);
}

async function convertFromText(text: string): Promise<Prosopography> {
  var s = new Readable();
  s.push(text);
  s.push(null);
  let result = [];
  //return an array of 1 prosopographies
  await processStream(s,function(prosopography){
    result.push(prosopography);
  });
  //return only first element
  return result[0];
}

async function search(searchRequest : SearchRequest): Promise<Prosopography[]> {
  console.log(`prosopographyService.search`);
  console.log(searchRequest);
  const mongodbRequest = convertSearchRequestToMongoRequest(searchRequest);
  console.log(mongodbRequest);
  return db
    .get()
    .collection('prosopography')
    .find(
      mongodbRequest,
      { reference: true, identity: true }
    )
    .limit(0)
    .toArray();
}

function convertSearchRequestToMongoRequest(searchRequest : SearchRequest): any{
  console.log('convertSearchRequestToMongoRequest');
  let criterions = [];

  if(searchRequest.name){
    criterions.push(generateSeachClause('identity.name.value',searchRequest.name,'STARTS'));
  }
  /**
  //FIXME : RULES ?
  if(searchRequest.grades){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.grades,'CONTAINS'));
  }
  if(searchRequest.status){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.status,'CONTAINS'));
  }
  if(searchRequest.discipline){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.discipline,'CONTAINS'));
  }
*/
  //CRITERIONS
  if(searchRequest.prosopography){
    let pCrit = [];
    for(let i in searchRequest.prosopography){
      console.log(searchRequest.prosopography[i]);
      let crit = searchRequest.prosopography[i];
      pCrit.push(generateSeachClause(crit.section+'.'+crit.subSection+'.value',crit.value,crit.matchType));
    }
    if(pCrit.length == 1){
      criterions.push(pCrit[0]);
    }else{
      criterions.push({"$and":pCrit});
    }
  }

  if(criterions.length == 1){
    return criterions[0];
  }else{
    return {
      "$and":criterions
    }
  }
}

function generateSeachClause(field, value, matchType){
  let res = {};
  switch(matchType){
    case 'EQUALS':
      res[field] = new RegExp('^'+value+'$',"i");;
      break;
    case 'STARTS':
      res[field] = new RegExp('^'+value,"i");
      break;
    case 'CONTAINS':
      res[field] = new RegExp(value,"i");
      break;
  }
  return res;
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findAll,
  indexSearch,
  findByReference,
  textSearch,
  indexDB,
  create,
  convertFromText,
  search,
  convertSearchRequestToMongoRequest,
};
