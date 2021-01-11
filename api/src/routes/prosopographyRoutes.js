// @flow

import express from 'express';
import uuid from 'uuid';
import passport from 'passport';

import service from '../services/prosopographyService';
import auth from '../services/authService';
//auth.setup();
import logger from '../utils/logger';


const router = express.Router();

const getPagination = function(req){
  return {
    page: parseInt(req.query.page),
    rows: parseInt(req.query.rows),
  };
}

router.get('/', async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: findAll`);
  let pagination = getPagination(req);

  try {
    const prosopographies = await service.findAll(pagination);
    logger.info(`${id}: findAll done`);
    res.set("X-Total-Count", prosopographies.length);
    res.send(prosopographies);
  } catch (err) {
    logger.error(`${id}: Failed to find all prosopographies - ${err}`);
    next(err);
  }
});


router.post('/seq/init', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: initCurrentReference`);
  try {
    const result = await service.getCurrentReference();
    if(result){
      logger.info(`${id}: getCurrentReference seq ${result.seq}`);
      //res.send({'seq':result.seq});
      res.status(400).json({'error':'KO','message' : `sequence already exists`});
    }else{
      await service.initReferenceSeq();
      logger.info(`${id}: initCurrentReference OK`);
      res.send({'message':'OK'});
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to get sequence - ${err}`
    );
    next(err);
  }
});


router.get('/seq/current', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: getCurrentReference`);
  try {
    const result = await service.getCurrentReference();
    if(result){
      logger.info(`${id}: getCurrentReference seq ${result.seq}`);
      res.send({'seq':result.seq});
    }else{
      res.status(500).json({'error':'KO','message' : `can't find sequence`});
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to get sequence - ${err}`
    );
    next(err);
  }
});

router.get('/search/:searchText', async (req, res, next) => {
  const id = uuid.v4();
  const searchText = req.params.searchText;
  logger.info(`${id}: textSearch on ${searchText}`);
  let pagination = getPagination(req);
  try {
    const prosopographies = await service.textSearch(searchText,pagination);
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
  let pagination = getPagination(req);
  try {
    //TODO Check searchRequest
    const searchRequest = req.body;
    const prosopographies = await service.search(searchRequest,pagination);
    logger.info(prosopographies.length);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies search advanced - ${err}`
    );
    next(err);
  }

});


router.post('/initGraph', async(req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: search graph`);
  try {
    const labels = await service.initGraph();
    logger.info(labels.length);
    res.send(labels);
  } catch (err) {
    logger.error(
        `${id}: Failed to load all labels init graph - ${err}`
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

router.get('/:reference', async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  const format = req.query.format?req.query.format:'json';
  logger.info(`${id}: findByReference on ${reference}`);
  try {
    const prosopography = await service.findByReference(reference);
    logger.info(`${id}: findByReference done`);
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
      res.status(404).json({'message' : `prosopography not found for reference ${reference}`});
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from findByReference on ${reference} - ${err}`
    );
    next(err);
  }
});

router.post('/', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography`);
  logger.info(`${id}: POST prosopography user ${req.user.name}`);
  //FIXME : add controls via mongoose ? or swagger ?
  const proso = req.body;
  try{
    const result = await service.create(proso);
    return res.send({'message':'OK'});
  }catch(err){
    console.log(`${id}: POST prosopography ERROR ${err}`);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

/**
* Handle prosopography creation from text format
*/
router.post('/create-from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography create-from-text`);
  logger.info(`${id}: POST prosopography create-from-text user ${req.user.name}`);

  let proso = req.body.prosopography;
  //Auto Generate <1a> fragment
  let seq = await service.getCurrentReference();
  let ref = parseInt(seq.seq);
  proso = `<1a> ${ref} \n`+proso;
  logger.info(proso);

  try{
    let p = await service.convertFromText(proso);
    const prosopography = await service.findByReference(p.reference);
    if(prosopography){
      logger.info(`POST prosopography from-text : ERROR prosopography ${p.reference} already exists`);
      return res.status(409).json({
          message: "Error",
          error: "prosopography reference already exists",
      });
    }else{
      await service.create(p);
      await service.updateCurrentReference(p);
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

router.post('/from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography from-text`);
  logger.info(`${id}: POST prosopography from-text user ${req.user.name}`);

  const proso = req.body.prosopography;
  const reference = req.body.reference;
  logger.info(proso);
  if(reference){
    logger.info(`${id}: POST prosopography from-text update ${reference}`);
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


router.post('/parse-text', async (req, res) => {
  const id = uuid.v4();
  logger.info(`${id}: POST prosopography parse-text`);

  const proso = req.body;
  try{
    let p = await service.convertFromText(proso);
    logger.info(`${id} POST prosopography parse-text : Parsing OK`);
    return res.send(p);
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

router.post('/re-index-from-raw/:reference', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.info(`${id}: reIndexFromRaw on ${reference}`);
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


router.delete('/:reference', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.info(`${id}: deleteByReference on ${reference}`);
  try {
    await service.remove(reference);
    logger.info(`${id}: deleteByReference done`);
    res.send({'message':'OK'});
  } catch (err) {
    logger.error(
      `${id}: Failed to delete with reference ${reference} - ${err}`
    );
    next(err);
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
