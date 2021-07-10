import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/draftService';
import pgService from '../services/prosopographyService';
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

router.get('/', async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET /draft findAll`);
  let pagination = getPagination(req);
  logger.debug(`${id}: GET /draft findAll pagination:`+JSON.stringify(pagination));
  try {
    const prosopographies = await service.findAll(pagination);
    logger.debug(`${id}: findAll done`);
    res.set("X-Total-Count", prosopographies.length);
    res.send(prosopographies);
  } catch (err) {
    logger.error(`${id}: Failed to find all draft - ${err}`);
    next(err);
  }
});


router.get('/:reference', async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  const format = req.query.format?req.query.format:'json';
  logger.debug(`${id}: GET /draft findByReference on ${reference}`);
  try {
    const prosopography = await service.findByReference(reference);
    logger.debug(`${id}: GET /draft findByReference done`);
    if(prosopography){
      switch(format){
        case 'raw':
          res.header('Content-Type','plain/text');
          res.send(prosopography.raw.join('\n'));
          break;
        case 'json':
        default:
          res.send(prosopography);
      }

    }else{
      res.status(404).json({'message' : `draft not found for reference ${reference}`});
    }

  } catch (err) {
    logger.error(
      `${id}: GET /draft : Failed findByReference on ${reference} - ${err}`
    );
    next(err);
  }
});

router.delete('/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: DELETE /draft deleteByReference on ${reference}`);
  try {
    await service.remove(reference);
    logger.debug(`${id}: DELETE /draft deleteByReference done`);
    res.send({'message':'OK'});
  } catch (err) {
    logger.error(
      `${id}: Failed to delete draft with reference ${reference} - ${err}`
    );
    next(err);
  }
});


/**
* Handle prosopography creation from text format
* @deprecated
*/
router.post('/create-from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST /draft/create-from-text`);
  logger.debug(`${id}: POST /draft/create-from-text user ${req.user.name}`);

  let proso = req.body.prosopography;
  //Auto Generate <1a> fragment
  let seq = await pgService.getCurrentReference();
  let ref = parseInt(seq.seq);
  proso = `<1a> ${ref} \n`+proso;
  logger.debug(proso);

  try{
    let p = await pgService.convertFromText(proso);
    const prosopography = await pgService.findByReference(p.reference);
    const draft = await service.findByReference(p.reference);
    if(prosopography || draft){
      logger.debug(`POST /draft/create-from-text : ERROR prosopography ${p.reference} already exists`);
      return res.status(409).json({
          message: "Error",
          error: "prosopography reference already exists",
      });
    }else{
      await service.create(p);
      await pgService.updateCurrentReference(p);
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

/*
* @deprecated
*/
router.post('/from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST /draft/from-text`);
  logger.debug(`${id}: POST /draft/from-text user ${req.user.name}`);

  const proso = req.body.prosopography;
  const reference = req.body.reference;
  logger.debug(proso);
  if(reference){
    logger.debug(`${id}: POST /draft/from-text update ${reference}`);
    try{
      let p = await pgService.convertFromText(proso);
      const prosopography = await pgService.findByReference(p.reference);
      if(prosopography){
        logger.debug(`${id}: POST /draft/from-text found ${prosopography.reference}`);
        //Update
        if( parseInt(reference) === parseInt(prosopography.reference)){
          const draft = await service.findByReference(p.reference);
          //update draft
          if(draft){
            p = {
              _id:draft._id,
              ...p
            };
            await service.update(p);
            return res.send({'message':'OK'});
          //create draft
          }else{
            await service.create(p);
            return res.send({'message':'OK'});
          }

        }else{
          return res.status(409).json({
              message: "Error",
              error: "prosopography reference doesn't match <1a> content",
          });
        }
      }else{
        return res.status(409).json({
            message: "Error",
            error: "prosopography reference not found",
        });
      }
    }catch(err){
      logger.error(err);
      return res.status(500).json({
          message: "Error",
          error: err,
      });
    }
  }else{
    let err = 'missing reference';
    logger.error(err);
    return res.status(400).json({
        message: "Error",
        error: err,
    });
  }
});

router.post('/publish/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: POST /draft/publish ${reference}`);
  logger.debug(`${id}: POST /draft/publish user ${req.user.name}`);
  const draft = await service.findByReference(reference);
  if(draft){
    const prosopography = await pgService.findByReference(reference);
    const removeProp = '_id';
    const {[removeProp]: remove, ...rest} = draft;
    //update
    if(prosopography){
      logger.debug(`${id}: POST /draft/publish will update`);
      let p = {
        _id:prosopography._id,
        ...rest
      };
      await pgService.update(p);
    //create
    }else{
      logger.debug(`${id}: POST /draft/publish will create`);
      await pgService.create(rest);
    }
    await service.remove(reference);
    return res.send({'message':'OK'});
  }else{
    logger.debug(`${id}: POST /draft/publish draft not found`);
    res.status(404).json({'message' : `draft not found for reference ${reference}`});
  }

});

export default router;
