// @flow

import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/testCartoService';
import auth from '../services/authService';
//auth.setup();
import logger from '../utils/logger';

const router = express.Router();

router.get('/' ,async (req, res, next) => {
    const id = uuid.v4();
    logger.info(`${id}: findAllVilles`);

    try {
        const villes = await service.findAllVilles();
        logger.info(`${id}: findAllVilles done`);
        res.set("X-Total-Count", villes.length);
        res.send(villes);
    } catch (err) {
        logger.error(`${id}: Failed to find all villes - ${err}`);
        next(err);
    }
});

router.get('/ville/:searchText', async (req, res, next) => {
    const id = uuid.v4();
    logger.info(`${id}: findVille`);
    const searchText = req.params.searchText;
    logger.info(`${id}: textSearch on ${searchText}`);

    try {
        const villes = await service.findVille(searchText);
        logger.info(`${id}: findVille done`);
        res.set("X-Total-Count", villes.length);
        res.send(villes);
    } catch (err) {
        logger.error(`${id}: Failed to find ville - ${err}`);
        next(err);
    }
});

router.get("/manuscrits", async (req, res, next) => {
    const id = uuid.v4();
    logger.info(`${id}: findAllManuscrits`);

    try {
        const manuscrits = await service.findAllManuscrits();
        logger.info(`${id}: findAllManuscrits done`);
        logger.info(manuscrits.length);
        res.set("X-Total-Count", manuscrits.length);
        res.send(manuscrits);
    } catch (err) {
        logger.error(`${id}: Failed to find all manuscrits - ${err}`);
        next(err);
    }
});

export default router;