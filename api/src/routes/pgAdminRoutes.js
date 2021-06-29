// @flow

import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/prosopographyService';
import auth from '../services/authService';
//auth.setup();
import logger from '../utils/logger';
import exporter from '../utils/exporter';

const router = express.Router();

const getPagination = function(req){
  return {
    page: parseInt(req.query.page),
    rows: parseInt(req.query.rows),
  };
}

const getFormat = function(req){
    return req.query.format?req.query.format:"json";
}


router.get('/all-ids', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.info(`${id}: all-id`);
  try {
    const ids = await service.getAllIds();
    if(ids){
      res.send(ids);
    }else{
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    }

  }catch(error){
    next(error);
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


//FIXME : implement backup
router.post('/backup', auth.isAuthenticated, async (req, res, next) => {
//
  const id = uuid.v4();
  logger.info(`${id}: backup`);
  logger.info(`${id}: backup user ${req.user.name}`);

  try{
    await service.backupAll();
    logger.info(`${id}: backup done`);
    res.send({'message':'OK'});
  }catch(error){
    console.log(error);
    next(error);
  }

});



router.post('/re-index-manus/:reference', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.info(`${id}: reIndexManus on ${reference}`);
  try {
    const prosopography = await service.findByReference(reference);
    if(prosopography){
      let p = await service.updateGeoMS(prosopography);
      res.send(p);
    }else{
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    }

  }catch(error){
    next(error);
  }
});




export default router;
