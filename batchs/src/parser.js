// @flow

/**
  Use https://github.com/nacholibre/node-readlines to read lines sync
*/

import readline from 'readline';

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

export function parser(record: $Shape<Prosopography>, line: string): $Shape<Prosopography> {
  const type = detectTypeOfLIne(line);
  switch (type) {
    case 'BIBLIOGRAPHY':
      break;
    case 'DATA_LINE':
      const reg = /^<([a-zA-Z0-9]*)>[ ]*(.)*/g
      const t = reg.exec(line);
      const dataType = t[1];
      const dataValue = t[2];
      const prop = dataLineTypes[dataType];
      record[prop] = dataValue;
      break;
    case 'EMPTY_LINE':
      console.log(record);
      //TODO saverecord

      break;
    default:

  }
  return record;
}

export function detectTypeOfLIne(line: string) {
  const skip = line.match(/^C/g);
  if (skip) {
    return 'BIBLIOGRAPHY';
  } else {
    const blank = line.match(/^</g);
    if (blank) {
      return 'DATA_LINE';
    } else {
      const empty = line.match(/^$/g);
      if (empty) {
        return 'EMPTY_LINE';
      }
    }
  }
  return 'ERROR_LINE';
}

export function processStream(stream: any) {
  const rl = readline.createInterface(stream);
  let record = {};

  rl.on('line', (line) => parser(record, line));

  rl.on('close', (line) => {
    console.log('done reading file.');
    return record;
  });
}

function processFile(inputFile) {
  var fs = require('fs'),
  readline = require('readline'),
  instream: any = fs.createReadStream(inputFile);
  processStream(instream);
}

// processFile('./tests/data/studium_input.txt');
