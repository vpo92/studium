// @flow

import db from '../utils/db';
//import { type Prosopography } from '../../types/Prosopography';
import { type Prosopography } from '../../../batchs/src/rawFilesParser/types';

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

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findAll,
  indexSearch,
  findByReference,
  textSearch,
};
