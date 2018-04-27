// @flow

/**
  Use https://github.com/nacholibre/node-readlines to read lines sync
*/

import readline from 'readline';
import fs from 'fs';

type Prosopography = {
  reference: string,
  name: string,
  nameVariant: string,
  job: string,
}

const dataLineTypes = {
  '1a':'reference',
  '1b':'name',
  '1c':'nameVariant',
  '1d':'job',
}

type Line = 'BIBLIOGRAPHY_START' | 'DATA' | 'EMPTY' | 'ERROR';

function parseDataLine(line: string) {
  const reg = /^<([a-zA-Z0-9]*)>[ ]*(.*)/g
  const t = reg.exec(line);
  const dataType = t[1];
  const dataValue = t[2];
  const prop = dataLineTypes[dataType];
  return { 
    type: 'DATA',
    value: {[prop]: dataValue}
  };
}

type ParsedLine = { type: Line, value?: $Shape<Prosopography> };
export function parser(record: $Shape<Prosopography>, line: string): ParsedLine {
  const type = detectTypeOfLIne(line);
  return {
    BIBLIOGRAPHY_START: (line) => ({ type }),
    DATA: parseDataLine,
    EMPTY: (line) => ({ type }),
    ERROR: (line) => ({ type }),
  }[type](line);
}

export function detectTypeOfLIne(line: string) {
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

function processStream(stream: any) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface(stream);
    let record = {};
    
    rl.on('line', (line) => {
      const parsedLine = parser(record, line);
      if (parsedLine.type === 'EMPTY') {
        console.log('record completed :', record);
      } else if (parsedLine.type === 'DATA') {
        record = {
          ...record,
          ...parsedLine.value,
        };
      }
    });

    rl.on('close', () => {
      resolve(record);
    });
  });
}

export async function processFile(inputFile: string) {
  const instream = fs.createReadStream(inputFile);
  return await processStream(instream);
}
