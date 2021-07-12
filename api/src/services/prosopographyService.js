// @flow
import db from '../utils/db';
import logger from '../utils/logger';
//import { type Prosopography } from '../../types/Prosopography';
import { type Prosopography } from '../../../batchs/src/rawFilesParser/types';
import { type SearchRequest } from '../../types/SearchRequest';
//import { processStream } from '../../../batchs/src/rawFilesParser/parser';
import { processStream } from '../../../batchs/src/rawFilesParser/simpleParser';
import { backup } from '../../../batchs/src/rawFilesParser/mongoService';
import {Readable} from 'stream';

const readPagination = function(pagination){

  if(pagination == null || (pagination && pagination.rows === -1)){
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
          { score: { $meta: 'textScore' }, reference: 1, identity: 1, link: 1, title: 1, raw: 1}
      )
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray();
}


async function textSearchTotalCount(searchText: string, pagination: any): Promise<Prosopography[]> {
  const pg = readPagination(pagination);

  return db.get()
  .collection('prosopography')
  .find(
      { $text: { $search: searchText } }
  ).count();
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
  logger.debug(`create index`);
  return db
      .get()
      .collection('prosopography')
      .createIndex({ '$**': 'text' },{ language_override: "dummy" });
}

async function create(prosopography: Prosopography): Promise<Any> {
  logger.info('ProsopographyService create');
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


async function initGraph(): Promise<Array> {
  logger.debug(`prosopographyService.initGraph`);
  return db
      .get()
      .collection('prosopography')
      .aggregate([{$group : { _id : "$extras.activityMediane", count: {$sum : 1}}},{$sort:{_id:1}}])
      .toArray();
}

async function search(searchRequest: SearchRequest, pagination: any): Promise<Prosopography[]> {
  logger.debug(`prosopographyService.search`);
  logger.debug(searchRequest);
  const pg = readPagination(pagination);
  const mongodbRequest = convertSearchRequestToMongoRequest(searchRequest);
  logger.debug(JSON.stringify(mongodbRequest));
  return db
      .get()
      .collection('prosopography')
      .find(
          mongodbRequest,
          {reference: 1, identity: 1, link: 1, title: 1, curriculum: 1, "origin.diocese.value": 1, extras: 1, raw: 1}
      )
      .sort({title: 1})
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray()
      .then(data => {

        return data.filter(function (item) {

          // Cette partie du code permet de simplifier la vue
          if (item.curriculum !== undefined && item.curriculum.grades !== undefined){
            item.nbGrades = item.curriculum.grades.length;
          }

          if (item.origin !== undefined && item.origin.diocese !== undefined && item.origin.diocese[0].value){
            item.originDiocese = item.origin.diocese[0].value;
          }

          if (item.textualProduction !== undefined){
            item.auteur = true;
          }

          if (item.identity.datesOfActivity !== undefined && item.identity.datesOfActivity[0] !== undefined &&
              item.identity.datesOfActivity[0].value ){
            item.datesOfActivity = item.identity.datesOfActivity[0].value;
          }

          return item;
        });
      });
}


async function searchTotalCount(searchRequest: SearchRequest, pagination: any): Promise<Prosopography[]> {
  logger.debug(`prosopographyService.search`);
  const mongodbRequest = convertSearchRequestToMongoRequest(searchRequest);
  return db
      .get()
      .collection('prosopography')
      .find(mongodbRequest)
      .count();
}

function convertSearchRequestToMongoRequest(searchRequest: SearchRequest): any {
  logger.debug('convertSearchRequestToMongoRequest');
  let criterions = [];
  let criterionsOr = [];

  //Handle activity
  if(searchRequest.activity && searchRequest.activity.start){
    if ( searchRequest.activity.start.from && searchRequest.activity.start.to) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.startDate.date'] = {
        $gte: parseInt(searchRequest.activity.start.from),
        $lte: parseInt(searchRequest.activity.start.to),
      };
      criterions.push(res);
    } else if (searchRequest.activity.start.from) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.startDate.date'] = {$gte: parseInt(searchRequest.activity.start.from)};
      criterions.push(res);
    } else if (searchRequest.activity.start.to) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.startDate.date'] = {$lte: parseInt(searchRequest.activity.start.to)};
      criterions.push(res);
    }
  }

  if(searchRequest.activity && searchRequest.activity.end){
    if (searchRequest.activity.end.from && searchRequest.activity.end.to) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.endDate.date'] = {
        $lte: parseInt(searchRequest.activity.end.to),
        $gte: parseInt(searchRequest.activity.end.from),
      };
      criterions.push(res);
    } else if (searchRequest.activity.end.from) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.endDate.date'] = {$gte: parseInt(searchRequest.activity.end.from)};
      criterions.push(res);
    } else if (searchRequest.activity.end.to) {
      let res = {};
      res['identity.datesOfActivity.meta.dates.endDate.date'] = {$lte: parseInt(searchRequest.activity.end.to)};
      criterions.push(res);
    }
  }
if(searchRequest.activityMediane) {
  if (searchRequest.graph && searchRequest.activityMediane.from == null){
    let res = {};
    res['extras.activityMediane'] = null;
    criterions.push(res);
  } else if (searchRequest.activityMediane.to && searchRequest.activityMediane.from){
    let res = {};
    res['extras.activityMediane'] = {
      $lte: parseInt(searchRequest.activityMediane.to),
      $gte: parseInt(searchRequest.activityMediane.from),
    };
    criterions.push(res);
  } else if (searchRequest.activityMediane.from){
    let res = {};
    res['extras.activityMediane'] = {$gte: parseInt(searchRequest.activityMediane.from)};
    criterions.push(res);
  } else if (searchRequest.activityMediane.to) {
    let res = {};
    res['extras.activityMediane'] = {$lte: parseInt(searchRequest.activityMediane.to)}
    criterions.push(res);
  }
}
  if (searchRequest.name) {
    criterionsOr.push(generateSearchClause('identity.name.value', searchRequest.name, 'CONTAINS'))
    criterionsOr.push(generateSearchClause('identity.nameVariant.value', searchRequest.name, 'CONTAINS'));
  }
  //Gestion des grades
  if (searchRequest.grade === "AUCUN"){
    let res = {};
    res['curriculum.grades'] = {$exists : false};
    criterions.push(res);
  }else if(searchRequest.grade === "ALL"){
    let res = {};
    res['curriculum.grades'] = {$exists : true};
    criterions.push(res);
  }else if (searchRequest.discipline && searchRequest.discipline !== 'ALL' && searchRequest.grade && searchRequest.grade !== 'ALL') {
    criterions.push(generateSearchClause('curriculum.grades.value', searchRequest.grade + ".*" + searchRequest.discipline, 'CONTAINS'));
  } else {
    if (searchRequest.grade && searchRequest.grade !== "ALL") {
      criterions.push(generateSearchClause('curriculum.grades.value', searchRequest.grade, 'CONTAINS'));
    }
    if (searchRequest.discipline && searchRequest.discipline !== "ALL") {
      criterions.push(generateSearchClause('curriculum.grades.value', searchRequest.discipline, 'CONTAINS'));
    }

  }

  //Gestion des statuts
  if(searchRequest.status){
    if (searchRequest.status.length !== 0) {
      if (searchRequest.status.length > 1) {
        for (let i in searchRequest.status) {
          if(searchRequest.status[i]=="NR"){
            let res = {};
            res['identity.status.value'] = {$exists : false};
            criterionsOr.push(res);
          }else{
            let status = searchRequest.status[i];
            criterionsOr.push(generateSearchClause('identity.status.value', status, 'CONTAINS'));
          }

        }
      } else {
        if(searchRequest.status[0]=="NR"){
          let res = {};
          res['identity.status.value'] = {$exists : false};
          criterions.push(res);
        }else{
          criterions.push(generateSearchClause('identity.status.value', searchRequest.status[0], 'CONTAINS'));
        }

      }
    }
  }

  if(searchRequest.sexe){
    if (searchRequest.sexe.length !== 0) {
      if (searchRequest.sexe.length > 1) {
        for (let i in searchRequest.sexe) {
          let sexe = searchRequest.sexe[i];
          criterionsOr.push(generateSearchClause('identity.gender.value', sexe, 'CONTAINS'));
        }
      } else {
        criterions.push(generateSearchClause('identity.gender.value', searchRequest.sexe[0], 'CONTAINS'));
      }
    }
  }

  let res = {};

  if (criterionsOr.length >= 1 && criterions.length >= 1){
    res = { "$and" : criterions, "$or" : criterionsOr};
  } else if (criterions.length === 0 && criterionsOr.length > 0){
    res = { "$or" : criterionsOr};
  } else if (criterionsOr.length === 0 && criterions.length > 0){
    res = { "$and" : criterions}
  }


  //CRITERIONS
  if (searchRequest.prosopography) {
    for (let i in searchRequest.prosopography) {
      let crit = searchRequest.prosopography[i];
      let field = crit.section + '.' + crit.subSection + '.value';
      // Si la valeur est null on veut que le champs existe sinon on traite le critère
      if (crit.value === null && crit.section !== null) {
        let resAux = {};
        if (crit.subSection) {
          if (crit.operator === "OR NOT" || crit.operator === "AND NOT"){
            resAux[crit.section + "." + crit.subSection] = {$exists: false};
          } else {
            resAux[crit.section + "." + crit.subSection] = {$exists: true};
          }
        } else {
          if (crit.operator === "OR NOT" || crit.operator === "AND NOT"){
            resAux[crit.section] = {$exists: false};
          } else {
            resAux[crit.section] = {$exists: true};
          }
        }

        switch (crit.operator) {
          case "AND NOT" :
          case 'AND' :
            res = { "$and" : [resAux, res]};
            break;
          case "OR NOT" :
          case 'OR' :
            res = {"$or": [resAux, res]};
            break;
        }
      } else if (crit.section !== null && crit.subSection !== null) {
        switch (crit.operator) {
          case "OR" :
            if (searchRequest.graph){
              let fieldAux = crit.section + '.' + crit.subSection
              let resAux1 = {};
              resAux1[fieldAux] = crit.value;
              res = {"$or" : [resAux1, res]};
            } else {
              res = {"$or" : [ generateSearchClause(field, escapeRegExp(crit.value), crit.matchType) , res]};
            }
            break;
          case "AND NOT" :
            let resAux1 = {};
            resAux1[field] = {$not: generateRegexNotOperator( escapeRegExp(crit.value), crit.matchType)};
            res = {"$and": [resAux1, res]};
            break;
          case "OR NOT":
            let resAux2 = {};
            resAux2[field] = {$not: generateRegexNotOperator( escapeRegExp(crit.value), crit.matchType)};
            res = {"$or": [resAux2, res]};
            break;
          default :
            res = {"$and" : [ generateSearchClause(field, escapeRegExp(crit.value), crit.matchType) , res]};
            break;
        }

      } else {
        continue;
      }
    }
  }

  //logger.debug(res);
  return res;
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

function escapeRegExp(string){
  // $& correspond à la chaîne correspondante
  // dans son intégralité
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

async function updateGeoMS(prosopography){
  logger.debug("updateGeoMS");
  if(prosopography.textualProduction){
    logger.debug("has textualProduction");
    for(let t in prosopography.textualProduction){
      logger.debug(t);
      let theme = prosopography.textualProduction[t];
      if(theme.opus){
        logger.debug("has opus");
        for(let o in theme.opus){
          let opus = theme.opus[o];
          if(opus.manuscrits){
            logger.debug("has manuscrits");
            for(let m in opus.manuscrits){
              let ms = opus.manuscrits[m];
              if(ms){
                await db.get()
                  .collection('manus')
                  .findOne({ REFERENCES_SOURCES: ms.value.slice(0, -1) })
                  .then( (ma) => {
                    if(ma){
                      prosopography.textualProduction[t].opus[o].manuscrits[m].meta['id'] = ma['Num'];
                    }
                  });
              }
            }
          }
        }
      }
    }
  }
  //logger.debug(prosopography);
  return update(prosopography);


  //recuperer les manuscrits
  //textualProduction --> [] --> opus [] --> manuscrits --> [] --> value
  //boucler dessus
  //puor chaque manus, on fait une recherche dans la table des manus
  //Si on trouve, on ajoute le num de manus dans la prosopogrphy en metatdonne "msId"
  //sinon rien
  //on update en base
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
  textSearchTotalCount,
  indexDB,
  create,
  update,
  remove,
  convertFromText,
  initGraph,
  search,
  searchTotalCount,
  convertSearchRequestToMongoRequest,
  getCurrentReference,
  updateCurrentReference,
  backupAll,
  initReferenceSeq,
  updateGeoMS,
};
