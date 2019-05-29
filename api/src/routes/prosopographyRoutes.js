// @flow

import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/prosopographyService';
import auth from '../services/authService';
//auth.setup();
import logger from '../utils/logger';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: findAll`);
  try {
    const prosopographies = await service.findAll();
    logger.info(`${id}: findAll done`);
    res.set("X-Total-Count", prosopographies.length);
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

router.post('/search/advanced', async(req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: search advanced`);
  try {
    //TODO Check searchRequest
    const searchRequest = req.body;
    const prosopographies = await service.search(searchRequest);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies search advanced - ${err}`
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
    const prosopography = await service.findByReference(reference);
    logger.info(`${id}: findByReference done`);
    if(prosopography){
      res.send(prosopography);
    }else{
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from findByReference on ${reference} - ${err}`
    );
    next(err);
  }
});

router.post('/', auth.isAuthenticated, (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography`);
  logger.info(`${id}: POST prosopography user ${req.user.name}`);
  //FIXME : add controls via mongoose ? or swagger ?
  const proso = req.body;
  try{
    service.create(proso);
    return res.send({'message':'OK'});
  }catch(err){
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

router.post('/from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography from-text`);
  logger.info(`${id}: POST prosopography from-text user ${req.user.name}`);

  const proso = req.body.prosopography;
  const reference = req.body.reference;
  logger.info(proso);
  if(reference){
    logger.info(`${id}: POST prosopography from-text update ${reference}`);
  }

  try{
    let p = await service.convertFromText(proso);
    const prosopography = await service.findByReference(p.reference);
    if(prosopography){
      logger.info(`${id}: POST prosopography from-text found ${prosopography.reference}`);
      //Update
      if( parseInt(reference) === parseInt(prosopography.reference)){
        p = {
          _id:prosopography._id,
          ...p
        };
        await service.update(p);
        return res.send({'message':'OK'});
      }else{
        logger.info(`POST prosopography from-text : ERROR prosopography ${p.reference} already exists`);
        return res.status(409).json({
            message: "Error",
            error: "prosopography reference already exists",
        });
      }

    }else{
      await service.create(p);
      return res.send({'message':'OK'});
    }
  }catch(err){
    logger.error(err);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

router.post('/indexDB', auth.isAuthenticated, (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: indexDB`);
  logger.info(`${id}: indexDB user ${req.user.name}`);

  try {
    service.indexDB();
    logger.info(`${id}: indexDB done`);
    res.send({'message':'OK'});
  } catch (err) {
    logger.error(
      `${id}: Failed to indexDB`
    );
    next(err);
  }
});

export default router;
