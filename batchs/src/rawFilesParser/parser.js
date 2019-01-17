// @flow

import readline from 'readline';
import fs from 'fs';
import {detectDates} from './util/date.parser';
import {detectNames} from './util/name.parser';
import {detectPlaces} from './util/place.parser';
import {detectTitles} from './util/title.parser';
import {detectInstitutions} from './util/institution.parser';
import {isComment} from './util/comment.parser';
import {isLink} from './util/comment.parser';

import {addPropToRecord} from './prop.util';
import {finalyseProsopography} from './util/special.prop.parser';

import type {
  ProsopographyRow,
  Line,
  ParsedLine,
  SaveRecordFunction,
} from './types.js';

const dataLineTypes: {[string]: $Keys<ProsopographyRow>} = {
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
}

function parseDataLine(line: string): ParsedLine {
  const reg = /^<([a-zA-Z0-9\.]*)>[ \t]*(.*)/g
  const t = reg.exec(line);
  if(!t) {
    console.error(`Could not parse line ${line}`);
    return {
      type: 'ERROR',
    }
  }
  const dataType = t[1];
  const dataValue = t[2];

  let meta = {
    dates: detectDates(dataValue),
    names: detectNames(dataValue),
    places: detectPlaces(dataValue),
    titles: detectTitles(dataValue),
    institutions: detectInstitutions(dataValue),
    isComment: isComment(dataValue),
    isLink: isLink(dataValue),
  };

  const prop = dataLineTypes[dataType];
  if(!prop) {
    console.error(`Unknown data type ${dataType}`);
    return {
      type: 'ERROR',
    }
  }else{
    return {
      type: 'DATA',
      value: { [prop]: {
        "value":dataValue,
        "meta":meta,
        }
      }
    };
  }
}

export function lineParser(line: string): ParsedLine {
  const type = detectTypeOfLine(line);
  return {
    BIBLIOGRAPHY_START: (line) => ({ type }),
    DATA: parseDataLine,
    EMPTY: (line) => ({ type }),
    ERROR: (line) => ({ type }),
  }[type](line);
}

export function detectTypeOfLine(line: string): Line {
  const skip = line.match(/^C/g);
  if (skip) {
    return 'BIBLIOGRAPHY_START';
  } else {
    const blank = line.match(/^</g);
    if (blank) {
      return 'DATA';
    } else {
      const empty = line.match(/^$/g);
      if (empty) {
        return 'EMPTY';
      }
    }
  }
  return 'ERROR';
}

type ComputeRecordFunction = (record: $Shape<ProsopographyRow>, parsedLine: ParsedLine, line : String) => $Shape<ProsopographyRow>;
export function computeOrSaveRecord(saveRecord: SaveRecordFunction): ComputeRecordFunction {
  return (record, parsedLine, line) => {

    if (parsedLine.type === 'DATA') {
      //FIXME : save current record and start new
      if(parsedLine.value &&  parsedLine.value.reference){
        console.log("FIRST LINE");
        //console.log(record);
        //if a record exist
        if(record.reference){
          record = finalyseProsopography(record);
          saveRecord(record);
        }
        //return 'FIRST_LINE';
        return addPropToRecord({raw:[line]}, parsedLine);
      }else{
        if(!record.raw){
          record.raw = [];
        }
        record.raw.push(line);
        return addPropToRecord(record, parsedLine);
      }
    } else if (parsedLine.type === 'EMPTY') {
      if (record.reference) {
        //console.log(record);
        record = finalyseProsopography(record);
        saveRecord(record);
      }
      return {};
    }
    return record;
  };
}

export function processStream(stream: any, saveRecord: SaveRecordFunction): Promise<void> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    let record = {};

    rl.on('line', (line) => {
      record = computeOrSaveRecord(saveRecord)(record, lineParser(line),line);
    });

    rl.on('close', () => {
      if (record.reference) {
        computeOrSaveRecord(saveRecord)(record, { type: 'EMPTY' },"");
      }
      resolve();
    });
  });
}

export async function processFile(inputFile: string, saveRecord: SaveRecordFunction): Promise<void> {
  const instream = fs.createReadStream(inputFile);
  return processStream(instream, saveRecord);
}
