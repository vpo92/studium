import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/prosopographyService';
import logService from '../services/logService';
import auth from '../services/authService';
import mongoService from '../services/mongoService';
//auth.setup();
import logger from '../utils/logger';
import exporter from '../utils/exporter';
import config from '../../config';
import fs from 'fs';
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


router.get('/all-ids', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: all-id`);
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

router.post('/indexDB', auth.isAdmin, (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: indexDB`);
  logger.debug(`${id}: indexDB user ${req.user.name}`);

  try {
    service.indexDB();
    logger.debug(`${id}: indexDB done`);
    res.send({'message':'OK'});
  } catch (err) {
    logger.error(
      `${id}: Failed to indexDB`
    );
    next(err);
  }
});

router.post('/backup', auth.isAdmin, async (req, res, next) => {
//
  const id = uuid.v4();
  logger.debug(`${id}: backup`);
  logger.debug(`${id}: backup user ${req.user.name}`);

  try{
    await service.backupAll();
    logger.debug(`${id}: backup done`);
    res.send({'message':'OK'});
  }catch(error){
    logger.error(error);
    next(error);
  }

});

router.post('/dump', auth.isAdmin, async (req, res, next) => {
  //
    const id = uuid.v4();
    logger.debug(`${id}: new dump`);
    logger.debug(`${id}: new dump user ${req.user.name}`);

    try{
      await mongoService.dumpStudium(config.mongooseDB, config.dumpFileName);
      logger.debug(`${id}: new dump done`);
      res.send({'message':'OK'});
    }catch(error){
      logger.error(error);
      next(error);
    }

  });

router.get('/dump', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: list dump`);
  logger.debug(`${id}: list dump user ${req.user.name}`);
  try{
    res.send(await mongoService.listDump(config.dumpFileName));
  }catch(error){
    logger.error(error);
    next(error);
  }


});


router.get('/dump/:dumpName', async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: download dump ${req.params.dumpName}`);
  try{
    let fileName = config.dumpFileName+"/"+req.params.dumpName;
    res.writeHead( 200, { 'Content-Type': 'application/octet-stream ' } );
      fs.createReadStream( fileName ).pipe( res );
  }catch(error){
    logger.error(error);
    next(error);
  }
});

router.post('/re-index-from-raw/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: reIndexFromRaw on ${reference}`);
  try {
    const prosopography = await service.findByReference(reference);
    if(prosopography){
      const raw = prosopography.raw.join("\n");
      let p = await service.convertFromText(raw);
      p._id = prosopography._id;
      await service.update(p);
      res.send(p);
    }else{
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    }

  }catch(error){
    next(error);
  }
});

router.post('/re-index-manus/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: reIndexManus on ${reference}`);
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

router.get('/logs', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  let pagination = getPagination(req);
  logger.debug(`${id}: GET /logs`);
  try {
    const logs = await logService.getLogs();
    if(logs){
      res.send(logs);
    }else{
      res.status(404).json({'message' : `no logs found`});
    }
  }catch(error){
    next(error);
  }
});

router.post('/logs/clear', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET /logs`);
  try {
    await logService.clearLogs();
    res.send({'message':'OK'});
  }catch(error){
    next(error);
  }
});

export default router;
