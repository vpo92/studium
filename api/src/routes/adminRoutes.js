import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/prosopographyService';
import logService from '../services/logService';
import auth from '../services/authService';
import jobService from '../services/jobService';
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

router.post('/indexDB', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: indexDB`);
  logger.debug(`${id}: indexDB user ${req.user.name}`);

  try {
    await service.indexDB();
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
  // Ne fait plus exécuter la sauvegarde dans le processus HTTP : empile le
  // job "backup" que le worker traitera (voir services/jobs/backupJob.js).
  const id = uuid.v4();
  logger.debug(`${id}: backup`);
  logger.debug(`${id}: backup user ${req.user.name}`);

  try{
    const job = await jobService.create('backup', {}, req.user, {});
    logger.debug(`${id}: backup job ${job._id} queued`);
    res.send({'message':'OK', 'job': jobService.serialize(job)});
  }catch(error){
    if(error.status === 409){
      return res.status(409).json({message: error.message, job: error.job || null});
    }
    logger.error(error);
    next(error);
  }

});

router.post('/re-index-from-raw/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: reIndexFromRaw on ${reference}`);
  try {
    const result = await service.reindexFromRaw(reference);
    if (result.status === 'not_found') {
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    } else {
      res.send(result.prosopography);
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
