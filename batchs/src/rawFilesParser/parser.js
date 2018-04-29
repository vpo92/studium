// @flow

import readline from 'readline';
import fs from 'fs';

import type {
  Prosopography,
  Line,
  ParsedLine,
  SaveRecordFunction,
} from './types.js';

const dataLineTypes: {[string]: $Keys<Prosopography>} = {
  '1a': 'reference',
  '1b': 'name',
  '1c': 'nameVariant',
  '1d': 'job',
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
  const prop = dataLineTypes[dataType];
  if(!prop) {
    console.error(`Unknown data type ${dataType}`);
    return {
      type: 'ERROR',
    } 
  }
  return {
    type: 'DATA',
    value: { [prop]: dataValue }
  };
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

type ComputeRecordFunction = (record: $Shape<Prosopography>, parsedLine: ParsedLine) => $Shape<Prosopography>;
export function computeOrSaveRecord(saveRecord: SaveRecordFunction): ComputeRecordFunction {
  return (record, parsedLine) => {
    if (parsedLine.type === 'DATA') {
      return {
        ...record,
        ...parsedLine.value,
      };
    } else if (parsedLine.type === 'EMPTY') {
      if (record.reference) {
        saveRecord(record);
      }
      return {};
    }
    return record;
  };
}

function processStream(stream: any, saveRecord: SaveRecordFunction): Promise<void> {;
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    let record = {};

    rl.on('line', (line) => {
      record = computeOrSaveRecord(saveRecord)(record, lineParser(line));
    });

    rl.on('close', () => {
      if (record.reference) {
        computeOrSaveRecord(saveRecord)(record, { type: 'EMPTY' });
      }
      resolve();
    });
  });
}

export async function processFile(inputFile: string, saveRecord: SaveRecordFunction): Promise<void> {
  const instream = fs.createReadStream(inputFile);
  return processStream(instream, saveRecord);
}
