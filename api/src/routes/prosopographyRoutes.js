// @flow

import express from 'express';
import uuid from 'uuid';

import service from '../services/prosopographyService';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: findAll`);
  try {
    const prosopographies = await service.findAll();
    logger.info(`${id}: findAll done`);
    res.send(prosopographies);
  } catch (err) {
    logger.error(`${id}: Failed to find all prosopographies - ${err}`);
    next(err);
  }
});
router.get('/search/:searchText', async (req, res, next) => {
  const id = uuid.v4();
  const searchText = req.params.searchText;
  logger.info(`${id}: textSearch on ${searchText}`);
  try {
    const prosopographies = await service.textSearch(searchText);
    logger.info(`${id}: textSearch done`);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from textSearch on ${searchText} - ${err}`
    );
    next(err);
  }
});
router.get('/index/:letter', async (req, res, next) => {
  const id = uuid.v4();
  const letter = req.params.letter;
  logger.info(`${id}: indexSearch on ${letter}`);
  try {
    const prosopographies = await service.indexSearch(letter);
    logger.info(`${id}: indexSearch done`);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from indexSearch on ${letter} - ${err}`
    );
    next(err);
  }
});
router.get('/:reference', async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.info(`${id}: findByReference on ${reference}`);
  try {
    const prosopographies = await service.findByReference(reference);
    logger.info(`${id}: findByReference done`);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from findByReference on ${reference} - ${err}`
    );
    next(err);
  }
});

export default router;
