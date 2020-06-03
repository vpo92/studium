import readline from 'readline';
import fs from 'fs';
import {detectDates} from './util/date.parser';
import {detectNames} from './util/name.parser';
import {detectPlaces} from './util/place.parser';
import {detectTitles} from './util/title.parser';
import {detectInstitutions} from './util/institution.parser';
import {detectCotes} from './util/cote.parser';
import {isComment} from './util/comment.parser';
import {isLink} from './util/comment.parser';
import {finalyseProsopography,finalyzeOpus} from './util/special.prop.parser';
//import {finalyseOpus} from './util/special.prop.parser';

const dataLineTypes = {
  '1a': 'reference',
  '1b': 'name',
  '1c': 'nameVariant', //define type SimpleValueArray..
  '1d': 'shortDescription',
  '1e': 'datesOfLife',
  '1f': 'datesOfActivity',
  '1g': 'activityMediane',
  '1h': 'gender',
  '1k': 'status',
  '2a': 'birthPlace',
  '2b': 'diocese',
  '2c': 'movesInOutParis',
  '3a': 'socialClassOrigin',
  '3b': 'familyNetwork',
  '3c': 'personalSocialClass',
  '3d': 'personalServicesRelationship',
  '3e': 'friends',
  '3f': 'controversyOrDebates',
  '3g': 'connectionsWith',
  '3h': 'memberOfGroups',
  '3i': 'politicalRelationships',
  '3j': 'professionalRelationships',
  '3k': 'willExecutor',
  '3l': 'studentProfessorRelationships',
  '5a': 'preUniversity',
  '5b': 'university',
  '5c': 'grades',
  //no '5d': '',
  '5e': 'universityCollege',
  '5f': 'collegeFundations',
  '6a': 'ecclesiasticalStatus',
  '6b': 'secularPosition',
  '6c': 'benefits',
  '6d': 'regularOrder',
  '6f': 'regularFunctions',
  '6i': 'popFunctions',
  '6j': 'otherFunctions',
  '6k': 'communityFundations',
  '7a': 'professorOrPerceptor',
  '7b': 'universityFunction',
  '7c': 'lawFunction',
  '7d': 'propertiesAdministrator',
  '7e': 'townAdministrator',
  '7f': 'culturalFunction',
  '7g': 'kingdowChurchFunction',
  '7h': 'kingdomCulturalFunction',
  '7i': 'kingdomVariousFunction',
  '7j': 'royalAdministration',
  '7k': 'localAdministrationFunction',
  '7l': 'representation',
  '7m': 'business',
  '7n': 'medicine',
  '7o': 'otherJob',
  '8a': 'importantPosition',
  '8d': 'jailed',
  '8e': 'violentDeath',
  '8f': 'exil',
  '8g': 'justiceFacts',
  '9':  'travels',
  '10a': 'universityCommission',
  '10b': 'otherCommission',
  '11a': 'parisHousing',
  '11b': 'otherHousing',
  '12a': 'incomes',
  '13a': 'will',
  '14a': 'gifts',
  '15a': 'emblems',
  '15b': 'seals',
  '16a':'orality',
  '17a':'otherActivities',
  '18.1':'bookOwner',
  '19' : 'manyFields',
  '20' : 'religion',
  '21' : 'philosophy',
  '22' : 'philosophyExtended',
  '23' : 'science',
  '24' : 'medicine',
  '25' : 'litterature',
  '26' : 'justice',
  '27' : 'pratical',
  '28' : 'musical',
  '30' : 'administrativePractice',
  '50' : 'history',
  '60' : 'political',
  '88' : 'discussedMusical',
  '89' : 'discussedManyFields',
  '90' : 'discussedReligion',
  '91' : 'discussedPhilosophy',
  '92' : 'discussedPhilosophyExtended',
  '94' : 'discussedMedicine',
  '93' : 'discussedScience',
  '95' : 'discussedLitterature',
  '96' : 'discussedJustice',
  '97' : 'discussedPratical',
  '98' : 'discussedHistory',
  '99' : 'discussedPolitical',
  '99s':'workSources',
  '99a':'workReferences',
  '99b':'bookReferences',
  '99c':'otherBases',
};


const opusLineTypes = {
  'a': 'title',
  'v' : 'titleVariant',
  'b' : 'dateAndPlace',
  'l' : 'language',
  'c' : 'manuscrits',
  'cc' : 'incipits',
  "ccc" : 'colophon',
  'd' : 'editionBefore1700',
  'e' : 'dedicaceOrAdress',
  'f' : 'editorialWork',
  'g' : 'versionWork',
  'i' : 'modernEdition',
  'j' : 'illustration',
  'k' : 'otherLanguage',
  "k1":		'latine'		,
  "k2":		'anglaise'		,
  "k3":		'allemande'		,
  "k4":		'française'		,
  "k5":		'hollandaise'		,
  "k6":		'italienne'		,
  "k7":		'espagnole'		,
  "k8":		'tchèque'		,
  "k9":		'gaélique'		,
  "k10":		'danoise'		,
  "k11":		'hongroise'		,
  "k12":		'galloise'		,
  "k13":		'provençale'		,
  "k14":		'polonaise'		,
  "k15":		'portugaise'		,
  "k16":		'suédoise'		,
  "k17":		'grecque'		,
  "k18":		'romanche'		,
  "k19":		'hébraïque'		,
  "k20":		'catalane'		,
  'm' : 'context',
  'n' : 'ISTC-GW',
};

function detectTypeOfLine(line){
  const skip = line.match(/^C/g);
  //bibliography
  if (skip) {
    return 'BIBLIOGRAPHY_START';
  } else {
    const blank = line.match(/^</g);
    if (blank) {
      if(line.match(/^<r>/g)){
        return 'REFERENCE';
      }else{
        if(line.match(/^<</g)){
          return 'OPUSDATA';
        }
        return 'DATA';
      }
    } else {
      const empty = line.match(/^$/g);
      if (empty) {
        return 'EMPTY';
      }
    }
  }
  return 'ERROR';
}

function detectParagraphe(line){
  const reg = /^<([a-zA-Z0-9\.]*)>[ \t]+(.*)/g
  const regexBiblio = /^<([0-9]+[a-z]+[0-9]+)>[ \t]+(.*)/g;
  const regexOpusData = /^<<([a-zA-Z0-9\.]+)>>[ \t]+(.*)/g;
  const regexOpusOtherVersionData = /^<<<([a-zA-Z0-9\.]+)>>>[ \t]+(.*)/g;

  if(line.match(regexBiblio)){
    const t = regexBiblio.exec(line);
    const regexOpus = /^([0-9]+)([a-z]+)([0-9]+)/g;
    const t2 = regexOpus.exec(t[1]);
    //console.log(t2[1]+'XXX'+t2[2]+'XXX'+t2[3]);
    let opusNumber = t2[3];
    let opusType = dataLineTypes[t2[1]]?dataLineTypes[t2[1]]:t2[1];
    let opusDataName = opusLineTypes[t2[2]]?opusLineTypes[t2[2]]:t2[1];
    return {
      name:opusDataName,
      value:t[2],
      isOpus:true,
      opusType:opusType,
      opusNumber:opusNumber,
    }
  }else if(line.match(regexOpusData)){
    const t = regexOpusData.exec(line);
    let name = opusLineTypes[t[1]]?opusLineTypes[t[1]]:t[1];
    return {
      name:name,
      value:t[2],
      isOpus:false,
    }
  }else if(line.match(regexOpusOtherVersionData)){
    const t = regexOpusOtherVersionData.exec(line);
    let name = opusLineTypes[t[1]]?opusLineTypes[t[1]]:t[1];
    return {
      name:name,
      value:t[2],
      isOpus:false,
    }
  }else{
    const t = reg.exec(line);
    if(t) {
      //console.error(`Could not parse line ${line}`);
      let name = dataLineTypes[t[1]]?dataLineTypes[t[1]]:t[1];
      return {
        name:name,
        value:t[2],
        isOpus:false,
      }
    }else{
      return null;
    }
  }
  //Exception ?
  return null;
}

export function parseLine(line){
  if(line === null || line === ""){
    return {typeOfLine:'IGNORE'};
  }
  let raw = {};
  let typeOfLine = detectTypeOfLine(line);
  raw.typeOfLine = typeOfLine;
  //console.log(typeOfLine);
  if(typeOfLine === 'DATA' || typeOfLine === 'OPUSDATA'){
    let para = detectParagraphe(line);
    if(para){
      raw.data = para;
      raw.meta = {
        dates: detectDates(para.value),
        names: detectNames(para.value),
        places: detectPlaces(para.value),
        titles: detectTitles(para.value),
        institutions: detectInstitutions(para.value),
        cotes: detectCotes(para.value),
        isComment: isComment(para.value),
        isLink: isLink(para.value),
      };
    }else{
      return {typeOfLine:'IGNORE'}
    }
  }else if(typeOfLine === 'REFERENCE'){
    raw.data = line.substring(3).trim();
  }
  //FIXME SUBDATA
  return raw;

}

function handleDataLine(record,parsingContext,raw,saveRecord){
  parsingContext.previousDataName = parsingContext.currentDataName;
  parsingContext.currentDataName = raw.data.name;

  //New file ?
  parsingContext.newFile = raw.data.name === 'reference';
  //New Data ?
  parsingContext.newData = parsingContext.currentDataName !== parsingContext.previousDataName;

  //Compute data
  if(parsingContext.newData){

    record[parsingContext.previousDataName] = parsingContext.currentData;
    //FIXME : add OPUS !
    parsingContext.currentData = [];
  }

  //New File?
  if(parsingContext.newFile){
    //FIXME : add OPUS !
    record = finalyseProsopography(record);
    if(record){
      parsingContext.recordCount++;
      saveRecord(record)
      .catch( (error) => {
        console.log("ERROR on record "+record.reference+" : "+error);
      });
    }
    record = {};
  }

  //Create New Data
  parsingContext.currentData.push({
  'value':raw.data.value,
  'meta':raw.meta,
  });
  return {
      parsingContext:parsingContext,
      record:record};
}


function handleOpusFirstLine(record,parsingContext,raw,saveRecord){

  //Save Previous OPUS
  if(parsingContext.opus){
    let idx = parsingContext.currentData.length;
    if(!parsingContext.currentData[idx-1].opus){
      parsingContext.currentData[idx-1].opus = [];
    }
    parsingContext.currentData[idx-1].opus.push(finalyzeOpus(parsingContext.opus));
    parsingContext.opus = {};
  }
  parsingContext.opus = {
    'title':[{
      value:raw.data.value,
      meta: {
        dates: detectDates(raw.data.value),
        names: detectNames(raw.data.value),
        places: detectPlaces(raw.data.value),
        titles: detectTitles(raw.data.value),
        institutions: detectInstitutions(raw.data.value),
        isComment: isComment(raw.data.value),
        isLink: isLink(raw.data.value),
      },
    }],
  };
  return {
      parsingContext:parsingContext,
      record:record};
}

function handleReferenceLine(record,parsingContext,raw,saveRecord){
  if(parsingContext.opus){
    let ks = Object.keys(parsingContext.opus);
    let k = ks[ks.length -1];
    //console.log(k);
    //console.log(parsingContext.opus[k]);
    let idx = parsingContext.opus[k].length -1;
    if(!parsingContext.opus[k][idx].reference){
      parsingContext.opus[k][idx].reference = [];
    }
    parsingContext.opus[k][idx].reference.push(raw.data);

  }else{
    let idx = parsingContext.currentData.length;
    if(!parsingContext.currentData[idx-1].reference){
      parsingContext.currentData[idx-1].reference = [];
    }
    parsingContext.currentData[idx-1].reference.push(raw.data);
  }

  return {
      parsingContext:parsingContext,
      record:record};

}

export function processStream(stream, saveRecord){
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);

    let record = {};
    let parsingContext = {
      currentData : [],
      currentDataIsOpus : false,
      currentDataName: null,
      previousDataName: null,
      newFile: true,
      newData: null,
      opus: null,
      recordCount: 0,
    };

    rl.on('line', (line) => {
      //console.log(line);
      //record = computeOrSaveRecord(saveRecord)(record, lineParser(line),line);
      //Update parsingContext

      let raw = parseLine(line);

      if(raw.typeOfLine === 'DATA' && !(raw.data.isOpus)){
        let r = handleDataLine(record,parsingContext,raw,saveRecord);
        parsingContext = r.parsingContext;
        record = r.record;

      }else if(raw.typeOfLine === 'DATA' && raw.data.isOpus){
        let r = handleOpusFirstLine(record,parsingContext,raw,saveRecord);
        parsingContext = r.parsingContext;
        record = r.record;

      }else if(raw.typeOfLine === 'OPUSDATA'){
        //console.log('OPUSDATA');

        if(parsingContext.opus){

          if(!parsingContext.opus[raw.data.name]){
            parsingContext.opus[raw.data.name] = [];
          }
          let val = {
            value:raw.data.value,
            meta: {
              dates: detectDates(raw.data.value),
              names: detectNames(raw.data.value),
              places: detectPlaces(raw.data.value),
              titles: detectTitles(raw.data.value),
              institutions: detectInstitutions(raw.data.value),
              isComment: isComment(raw.data.value),
              isLink: isLink(raw.data.value),
            },
          };
          parsingContext.opus[raw.data.name].push(val);

          //FIXME : meta
        }else{
          //console.log('warning...');
        }


      }else if(raw.typeOfLine === 'REFERENCE'){
        let r = handleReferenceLine(record,parsingContext,raw,saveRecord);
        parsingContext = r.parsingContext;
        record = r.record;

      }else if(raw.typeOfLine === 'IGNORE'){
        console.log(`IGNORE line : ${line}`);
      }
      //console.log(parsingContext);

      //Add raw
      if(!record.raw){
        record.raw = [];
      }
      record.raw.push(line);
    });

    rl.on('close', () => {
      //Save pending record
      record[parsingContext.previousDataName] = parsingContext.currentData;
      record = finalyseProsopography(record);
      if(record){
        parsingContext.recordCount++;
        saveRecord(record)
        .catch( (error) => {
          console.log("ERROR on record "+record.reference+" : "+error);
        });
      }
      console.log("PARSER END nbrecord:"+parsingContext.recordCount);
      //if (record.reference) {
        //computeOrSaveRecord(saveRecord)(record, { type: 'EMPTY' },"");
      //}
      resolve();
    });
  });
}

export async function processFile(inputFile, saveRecord){
  const instream = fs.createReadStream(inputFile);
  return processStream(instream, saveRecord);
}
