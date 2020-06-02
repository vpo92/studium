// @flow
import db from '../utils/db';
//import { type Prosopography } from '../../types/Prosopography';
import { type Prosopography } from '../../../batchs/src/rawFilesParser/types';
import { type SearchRequest } from '../../types/SearchRequest';
//import { processStream } from '../../../batchs/src/rawFilesParser/parser';
import { processStream } from '../../../batchs/src/rawFilesParser/simpleParser';
import { backup } from '../../../batchs/src/rawFilesParser/mongoService';
import {Readable} from 'stream';

const readPagination = function(pagination){
  let page = (pagination && pagination.page?pagination.page:1);
  let rows = (pagination && pagination.rows?pagination.rows:50);
  return {
    "skip" : (page-1)*rows,
    "limit" : rows,
  }

}


async function findAll(pagination: any): Promise<Prosopography[]> {
  const pg = readPagination(pagination);

  return await db
      .get()
      .collection('prosopography')
      .find()
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray();
}


async function getAllIds(){
  //FIXME : add controls
  return db
      .get()
      .collection('prosopography')
      .find({},{_id:0,reference:1})
      .limit(0)
      .map((item) => {return item.reference;})
      .toArray();

}

async function textSearch(searchText: string, pagination: any): Promise<Prosopography[]> {
  const pg = readPagination(pagination);

  return await db
      .get()
      .collection('prosopography')
      .find(
          { $text: { $search: searchText } },
          { score: { $meta: 'textScore' }, reference: true, identity: true, link: true, title: true }
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray();
}

function indexSearch(letter: string): Promise<Prosopography[]> {
  const regex = new RegExp(`^${letter}`, 'g');
  return db
      .get()
      .collection('prosopography')
      .find(
          { 'identity.name.value': { $regex: regex, $options: '-i' } },
          { reference: true, link: true, title: true},
      )
      .limit(0)
      .sort({title:1})
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
      .createIndex({ '$**': 'text' },{ language_override: "dummy" });
}

async function create(prosopography: Prosopography): Promise<Any> {
  const p = await findByReference(prosopography.reference);
  if(p){
    //throw
    throw "Reference already exists";
  }else{
    return db
        .get()
        .collection('prosopography')
        .insert(prosopography);
  }

}

async function update(prosopography: Prosopography): Promise<Any> {
  //FIXME : add controls
  return db
      .get()
      .collection('prosopography')
      .save(prosopography);
}


async function remove(reference: string): Promise<Any> {
  //FIXME : add controls
  return db
      .get()
      .collection('prosopography')
      .remove({ reference: reference });
}

async function convertFromText(text: string): Promise<Prosopography> {
  let s = new Readable();
  s.push(text);
  s.push(null);
  let result = [];
  let localSave = function(prosop){
    return new Promise((resolve, reject) => {
      try{
        result.push(prosop);
      }catch(error){
        reject(error);
      }
      resolve();
    });
  };
  await processStream(s,localSave);
  return result[0];
}

async function search(searchRequest: SearchRequest, pagination: any): Promise<Prosopography[]> {
  console.log(`prosopographyService.search`);
  console.log(searchRequest);
  const pg = readPagination(pagination);
  const mongodbRequest = convertSearchRequestToMongoRequest(searchRequest);
  console.log(mongodbRequest);
  return db
      .get()
      .collection('prosopography')
      .find(
          mongodbRequest,
          {reference: true, identity: true, link: true, title: true}
      )

      .skip(pg.skip)
      .limit(pg.limit)
      .toArray()
      .then(data => {

        if (!searchRequest.activityMediane.to && !searchRequest.activityMediane.from){
          return data;
        }

        return data.filter(function (item) {
          let startDate = item.identity.datesOfActivity[0].meta.dates[0].startDate.date;
          let endDate = item.identity.datesOfActivity[0].meta.dates[0].endDate.date;
          let medianeDate = (startDate + endDate) / 2;


          if (searchRequest.activityMediane.from && searchRequest.activityMediane.to) {
            return medianeDate >= searchRequest.activityMediane.from && medianeDate <= searchRequest.activityMediane.to;
          } else if (searchRequest.activityMediane.from) {
            return medianeDate >= searchRequest.activityMediane.from;
          } else {
            return medianeDate <= searchRequest.activityMediane.to;
          }
        })
      });
}

function convertSearchRequestToMongoRequest(searchRequest: SearchRequest): any{
  console.log('convertSearchRequestToMongoRequest');
  let criterions = [];
  /*
    if(searchRequest.name){
      criterions.push(generateSeachClause('identity.name.value',searchRequest.name,'STARTS'));
    }*/


  if (searchRequest.activity.from){
    let res={};
    res['identity.datesOfActivity.meta.dates.startDate.date'] = {$gte: parseInt(searchRequest.activity.from)};
    criterions.push(res);
  }


  if (searchRequest.activity.to){
    let res={};
    res['identity.datesOfActivity.meta.dates.endDate.date'] = {$lte: parseInt(searchRequest.activity.to) };
    criterions.push(res);
  }

  if (searchRequest.name){
    criterions.push(generateSeachClause('identity.name.value', searchRequest.name, 'CONTAINS'));
  }

  if(searchRequest.grade && searchRequest.grade!=="ALL"){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.grade,'CONTAINS'));
  }
  if(searchRequest.status && searchRequest.status!=="ALL"){
    criterions.push(generateSeachClause('identity.status.value',searchRequest.status,'CONTAINS'));
  }
  /*if(searchRequest.discipline){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.discipline,'CONTAINS'));
  }
*/
  //CRITERIONS
  if(searchRequest.prosopography){
    let pCrit = [];
    for(let i in searchRequest.prosopography){
      // console.log(searchRequest.prosopography[i]);
      let crit = searchRequest.prosopography[i];
      pCrit.push(generateSeachClause(crit.section+'.'+crit.subSection+'.value',crit.value,crit.matchType));
    }
    if(pCrit.length === 1){
      criterions.push(pCrit[0]);
    }else{
      criterions.push({"$and":pCrit});
    }
  }

  if(criterions.length === 1){
    return criterions[0];
  }else{
    return {
      "$and":criterions,
    }
  }
}

function generateSeachClause(field, value, matchType){
  let res = {};
  switch(matchType){
    case 'EQUALS':
      res[field] = new RegExp('^'+value+'$',"i");
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

async function getCurrentReference(){
  //FIXME : add controls
  return db
      .get()
      .collection('prosopography_seq')
      .findOne()
}


async function updateCurrentReference(){
  //FIXME : add controls
  return db
      .get()
      .collection('prosopography_seq')
      .update({},{$inc : {'seq':1}})
}

async function backupAll(){
  return backup("/tmp/");
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findAll,
  getAllIds,
  indexSearch,
  findByReference,
  textSearch,
  indexDB,
  create,
  update,
  remove,
  convertFromText,
  search,
  convertSearchRequestToMongoRequest,
  getCurrentReference,
  updateCurrentReference,
  backupAll,
};
