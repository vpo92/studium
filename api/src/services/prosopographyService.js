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
          {reference: true, identity: true, link: true, title: true, curriculum: true, "origin.diocese.value": true, textualProduction: true}
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

          if (item.curriculum !== undefined && item.curriculum.grades !== undefined){
            item.nbGrades = item.curriculum.grades.length;
          }

          if (item.origin !== undefined && item.origin.diocese !== undefined && item.origin.diocese[0].value){
            item.originDiocese = item.origin.diocese[0].value;
          }

          if (item.textualProduction !== undefined){
            item.auteur = true;
          }

          // ALL THIS IF BLOCK IS FOR LOOKING WHERE THE DATES ARE *
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
  let criterionsOr = [];

  //Permet d'enlever les fiches ne possèdant pas de date lors de la recherche par mediane
  if (searchRequest.activityMediane.from || searchRequest.activityMediane.to){
    let res = {};
    res['identity.datesOfActivity.meta.dates.date'] = {$exists:true} ;
    res['identity.datesOfActivity.meta.dates.startDate'] = {$exists: true};
    res['identity.datesOfActivity.meta.dates.endDate.date']= {$ne:null};
    criterionsOr.push(res);
  }

  if (searchRequest.activity.start.from && searchRequest.activity.start.to){
    let res={};
    res['identity.datesOfActivity.meta.dates.startDate.date'] = {$gte: parseInt(searchRequest.activity.start.from), $lte: parseInt(searchRequest.activity.start.to)};
    criterions.push(res);
  } else if (searchRequest.activity.start.from){
    let res={};
    res['identity.datesOfActivity.meta.dates.startDate.date'] = {$gte: parseInt(searchRequest.activity.start.from)};
    criterions.push(res);
  } else if (searchRequest.activity.start.to){
    let res={};
    res['identity.datesOfActivity.meta.dates.startDate.date'] = {$lte: parseInt(searchRequest.activity.start.to)};
    criterions.push(res);
  }


  if (searchRequest.activity.end.from && searchRequest.activity.end.to){
    let res={};
    res['identity.datesOfActivity.meta.dates.endDate.date'] = {$lte: parseInt(searchRequest.activity.end.to), $gte : parseInt(searchRequest.activity.end.from)};
    criterions.push(res);
  } else if (searchRequest.activity.end.from){
    let res={};
    res['identity.datesOfActivity.meta.dates.endDate.date'] = {$gte: parseInt(searchRequest.activity.end.from) };
    criterions.push(res);
  } else if (searchRequest.activity.end.to){
    let res={};
    res['identity.datesOfActivity.meta.dates.endDate.date'] = {$lte: parseInt(searchRequest.activity.end.to) };
    criterions.push(res);
  }

  if (searchRequest.name){
    criterionsOr.push(generateSearchClause('identity.name.value', searchRequest.name, 'CONTAINS'))
    criterionsOr.push(generateSearchClause('identity.nameVariant.value', searchRequest.name, 'CONTAINS' ));
  }

  if (searchRequest.discipline && searchRequest.discipline !== 'ALL' && searchRequest.grade && searchRequest.grade !== 'ALL'){
    criterions.push(generateSearchClause('curriculum.grades.value', searchRequest.grade+".*"+searchRequest.discipline, 'CONTAINS'));
  } else {

    if(searchRequest.grade && searchRequest.grade!=="ALL"){
      criterions.push(generateSearchClause('curriculum.grades.value',searchRequest.grade,'CONTAINS'));
    }

    if(searchRequest.discipline && searchRequest.discipline !== "ALL"){
      criterions.push(generateSearchClause('curriculum.grades.value',searchRequest.discipline,'CONTAINS'));
    }

  }

  if(searchRequest.status.length !== 0){
    if (searchRequest.status.length>1){
      for (let i in searchRequest.status){
        let status = searchRequest.status[i];
        criterionsOr.push(generateSearchClause('identity.status.value',status,'CONTAINS'));
      }
    } else {
      criterions.push(generateSearchClause('identity.status.value', searchRequest.status[0], 'CONTAINS'));
    }
  }

  if(searchRequest.sexe.length !== 0){
    if (searchRequest.sexe.length > 1){
      for (let i in searchRequest.sexe){
        let sexe = searchRequest.sexe[i];
        criterionsOr.push(generateSearchClause('identity.gender.value',sexe,'CONTAINS'));
      }
    } else {
      criterions.push(generateSearchClause('identity.gender.value', searchRequest.sexe[0], 'CONTAINS'));
    }
  }


  //CRITERIONS
  if(searchRequest.prosopography){
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
            criterionsOr.push(generateSearchClause(field,crit.value,crit.matchType));
            break;
          case "NOT" :
            let res = {};
            res[field] = {$not: generateRegexNotOperator(crit.value, crit.matchType)} ;
            criterions.push(res);
            break;
          default :
            criterions.push(generateSearchClause(field,crit.value,crit.matchType));
            break;
        }

      } else {
        continue;
      }
    }
  }

  if (criterions.length === 0 && criterionsOr === 0){
    return;
  } else {
    if(criterions.length === 1 && criterionsOr.length ===0){
      return criterions[0];
    } else if (criterionsOr.length >= 1 && criterions.length === 0){
      return {
        "$or" : criterionsOr,
      }
    }else{
      return {
        "$and":criterions,
        "$or":criterionsOr,
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


function generateSearchClause(field, value, matchType){
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
    case 'END' :
      res[field] = new RegExp('.*'+value+'$', "i");
  }

  return res;
}

async function initReferenceSeq(){
  return db
    .get()
    .collection('prosopography_seq')
    .insertOne({'seq':50000})
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
  initReferenceSeq,
};
