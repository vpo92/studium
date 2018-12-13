// @flow

import db from '../utils/db';
//import { type Prosopography } from '../../types/Prosopography';
import { type Prosopography } from '../../../batchs/src/rawFilesParser/types';
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
};
