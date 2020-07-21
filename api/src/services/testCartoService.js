// @flow
import db from '../utils/db';
import { type ville } from '../../../batchs/src/rawFilesParser/types';
import type {manuscrit, Prosopography} from "../../../batchs/src/rawFilesParser/types";




async function findAllVilles(): Promise<Prosopography[]> {
    return await db
        .get()
        .collection('villes')
        .find()
        .toArray();
}

async function findVille(letter: string): Promise<ville[]> {
    const regex = new RegExp(`^${letter}`, 'gi');
    return await db
        .get()
        .collection('villes')
        .findOne(
            { 'Ville': { $regex: regex } },
        );
}

async function findAllManuscrits(): Promise<manuscrit[]>{
    return await db
        .get()
        .collection('manuscrits')
        .find()
        .toArray();
}



module.exports = {
    findAllVilles,
    findVille,
    findAllManuscrits,
};
