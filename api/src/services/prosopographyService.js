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
  const regex = new RegExp(`^${letter}`, 'gi');
  return db
      .get()
      .collection('prosopography')
      .find(
          { 'identity.name.value': { $regex: regex } },
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
      .limit(0)
      .toArray()
      .then(data => {

        return data.filter(function (item) {

          // MAYBE TO REPLACE; THIS PART OF CODE IS BECAUSE OF HETEROGENEOUS DATA
          if (item.identity.datesOfActivity === undefined || item.identity.datesOfActivity[0].meta.dates === undefined){
            return item;
          }

          if (item.identity.datesOfActivity[0].meta.dates.length === 0){
            //console.log("not in datesActivity[0]");
            if (item.identity.datesOfActivity[1]===undefined || item.identity.datesOfActivity[1].meta.dates ===null ){
              return item;
            }
            item.startDate = item.identity.datesOfActivity[1].meta.dates[0].startDate.date;
            item.endDate = item.identity.datesOfActivity[1].meta.dates[0].endDate.date;
            item.mediane = Math.floor((item.startDate + item.endDate) / 2);
          } else {
            if(item.identity.datesOfActivity[0].meta.dates[0].date !== undefined ){
              //console.log("in date simple");
              item.mediane = Math.floor(item.startDate = (item.endDate = item.identity.datesOfActivity[0].meta.dates.date));
            } else {
              //console.log("ok");
              item.startDate = item.identity.datesOfActivity[0].meta.dates[0].startDate.date;
              if (item.identity.datesOfActivity[0].meta.dates[0].endDate === null){
                return item;
              }
              item.endDate = item.identity.datesOfActivity[0].meta.dates[0].endDate.date;
              item.mediane = Math.floor((item.startDate + item.endDate) / 2);
            }
          }

          if (!searchRequest.activityMediane.to && !searchRequest.activityMediane.from){
            return item;
          }

          if (searchRequest.activityMediane.from && searchRequest.activityMediane.to) {
            return item.mediane >= searchRequest.activityMediane.from && item.mediane <= searchRequest.activityMediane.to;
          } else if (searchRequest.activityMediane.from) {
            return item.mediane >= searchRequest.activityMediane.from;
          } else {
            return item.mediane <= searchRequest.activityMediane.to;
          }
        });
      });
}

function convertSearchRequestToMongoRequest(searchRequest: SearchRequest): any{
  console.log('convertSearchRequestToMongoRequest');
  let criterions = [];
  /*
    if(searchRequest.name){
      criterions.push(generateSeachClause('identity.name.value',searchRequest.name,'STARTS'));
    }*/

  if (searchRequest.activityMediane.from || searchRequest.activityMediane.to){
    let res = {};
    res['$or'] = [{'identity.datesOfActivity.meta.dates.date':{$exists:true}},{'identity.datesOfActivity.meta.dates.startDate':{$exists: true}}];
    res['identity.datesOfActivity.meta.dates.endDate.date']= {$ne:null};
    criterions.push(res);
  }

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
    criterions.push(generateSeachClause('identity.nameVariant.value', searchRequest.name, 'CONTAINS' ))
  }

  if(searchRequest.grade && searchRequest.grade!=="ALL"){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.grade,'CONTAINS'));
  }
  if(searchRequest.status && searchRequest.status!=="ALL"){
    criterions.push(generateSeachClause('identity.status.value',searchRequest.status,'CONTAINS'));
  }
  if(searchRequest.discipline && searchRequest.discipline !== "ALL"){
    criterions.push(generateSeachClause('curriculum.grades.value',searchRequest.discipline,'CONTAINS'));
  }

  //CRITERIONS
  if(searchRequest.prosopography){
    let pCrit = [];
    let pCritOr = [];
    for(let i in searchRequest.prosopography){

      let crit = searchRequest.prosopography[i];
      let field = crit.section+'.'+crit.subSection+'.value';

      // Si la valeur est null on veut que le champs existe sinon on traite le critère
      if (crit.value === null && crit.section!==null){
        let res = {};
        if (crit.subSection){
          res[crit.section+"."+crit.subSection] = {$exists : true};
        } else {
          res[crit.section] = {$exists : true};
        }
        criterions.push(res);

      } else if (crit.section !== null && crit.subSection !== null ) {

        switch (crit.operator) {
          case "OR" :
            pCritOr.push(generateSeachClause(field,crit.value,crit.matchType));
            break;
          case "NOT" :
            let res = {};
            res[field] = {$not: generateRegexNotOperator(crit.value, crit.matchType)} ;
            criterions.push(res);
            break;
          default :
            pCrit.push(generateSeachClause(field,crit.value,crit.matchType));
            break;
        }

      } else {
        continue;
      }
    }
    /*if(pCrit.length === 1){
      criterions.push(pCrit[0]);
    }else{*/
    if (pCritOr.length !== 0){
      criterions.push({"$or": pCritOr});
    }
    if (pCrit.length !== 0){
      criterions.push({"$and":pCrit});
    }
    //}
  }

  if (criterions.length === 0){
    return;
  } else {
    if(criterions.length === 1){
      return criterions[0];
    }else{
      return {
        "$and":criterions,
      }
    }
  }

}

function generateRegexNotOperator(value, matchType){
  switch (matchType) {
    case 'EQUALS':
      return new RegExp('^'+value+'$',"i");
    case 'STARTS':
      return new RegExp('^'+value,"i");
    case 'CONTAINS':
      return new RegExp(value,"i");
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
