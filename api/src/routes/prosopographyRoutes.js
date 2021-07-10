// @flow

import express from 'express';
import uuid from 'uuid';
import passport from 'passport';
import service from '../services/prosopographyService';
import auth from '../services/authService';
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

/**
* Get All prosopography
*/
router.get('/', async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET / findAll`);
  let pagination = getPagination(req);
  logger.debug(`${id}: findAll pagination:`+JSON.stringify(pagination));
  try {
    const prosopographies = await service.findAll(pagination);
    logger.debug(`${id}: findAll done`);
    res.set("X-Total-Count", prosopographies.length);
    res.send(prosopographies);
  } catch (err) {
    logger.error(`${id}: Failed to find all prosopographies - ${err}`);
    next(err);
  }
});

/**
* Init pg reference seq
*/
router.post('/seq/init', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST /seq/init initCurrentReference`);
  try {
    const result = await service.getCurrentReference();
    if(result){
      logger.debug(`${id}: getCurrentReference seq ${result.seq}`);
      //res.send({'seq':result.seq});
      res.status(400).json({'error':'KO','message' : `sequence already exists`});
    }else{
      await service.initReferenceSeq();
      logger.debug(`${id}: initCurrentReference OK`);
      res.send({'message':'OK'});
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to get sequence - ${err}`
    );
    next(err);
  }
});

/**
* Get current reference seq
*/
router.get('/seq/current', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET /sec/current getCurrentReference`);
  try {
    const result = await service.getCurrentReference();
    if(result){
      logger.debug(`${id}: getCurrentReference seq ${result.seq}`);
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

/*
* Search by keyword
*/
router.get('/search/:searchText', async (req, res, next) => {
  const id = uuid.v4();
  const searchText = req.params.searchText;
  logger.debug(`${id}: GET /search/:searchText on ${searchText}`);

  let format = getFormat(req);
  let pagination = getPagination(req);

  logger.debug(`${id}: textSearch format : ${format}`);

  if(format!='json'){
    pagination={
      "page": 1,
      "rows": -1,
    };
  }

  logger.debug(`${id}: textSearch pagination : ${JSON.stringify(pagination)}`);

  try {
    const totalCount = await service.textSearchTotalCount(searchText,pagination);
    const prosopographies = await service.textSearch(searchText,pagination);
    logger.debug(`${id}: textSearch done`);

    switch(format){

      case 'csv':
        logger.debug(`${id}: textSearch format : ${format}`);
        exporter.sendCSVFile(res,prosopographies,'search-'+searchText);
        break;
      case 'txt':
        logger.debug(`${id}: textSearch format : ${format}`);
        exporter.sendTXTFile(res,prosopographies,'search-'+searchText);
        break;
      default:
        logger.debug(`${id}: textSearch format : default=json`);
        res.header('X-Total-Count',totalCount);
        res.send(prosopographies);
    }

  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from textSearch on ${searchText} - ${err}`
    );
    next(err);
  }
});

/*
* Search by criteria
*/
router.post('/search/advanced', async(req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: search advanced`);

  let format = getFormat(req);
  let pagination = getPagination(req);

  logger.debug(`${id}: search format : ${format}`);

  if(format!='json'){
    pagination={
      "page": 1,
      "rows": -1,
    };
  }

  logger.debug(`${id}: search pagination : ${JSON.stringify(pagination)}`);

  try {
    //TODO Check searchRequest
    const searchRequest = req.body;
    const totalCount = await service.searchTotalCount(searchRequest,pagination);
    const prosopographies = await service.search(searchRequest,pagination);

    switch(format){

      case 'csv':
        logger.debug(`${id}: search format : ${format}`);
        exporter.sendCSVFile(res,prosopographies,'search');
        break;
      case 'txt':
        logger.debug(`${id}: search format : ${format}`);
        exporter.sendTXTFile(res,prosopographies,'search');
        break;
      case 'pdf':
        logger.debug(`${id}: search format : ${format}`);
        break;
      default:
        logger.debug(`${id}: search format : default=json`);
        res.header("Access-Control-Expose-Headers","*");
        res.header('X-Total-Count',totalCount);
        res.send(prosopographies);
    }


  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies search advanced - ${err}`
    );
    next(err);
  }

});

/*
* ???
*/
router.post('/initGraph', async(req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: search graph`);
  try {
    const labels = await service.initGraph();
    logger.debug(labels.length);
    res.send(labels);
  } catch (err) {
    logger.error(
        `${id}: Failed to load all labels init graph - ${err}`
    );
    next(err);
  }

});

/**
* Get pg by Index
*/
router.get('/index/:letter', async (req, res, next) => {
  const id = uuid.v4();
  const letter = req.params.letter;
  logger.debug(`${id}: indexSearch on ${letter}`);
  try {
    const prosopographies = await service.indexSearch(letter);
    logger.debug(`${id}: indexSearch done`);
    res.send(prosopographies);
  } catch (err) {
    logger.error(
      `${id}: Failed to load all prosopographies from indexSearch on ${letter} - ${err}`
    );
    next(err);
  }
});

/**
* Get all pg Ids
*/
router.get('/all-ids', auth.isAuthenticated, async (req, res, next) => {
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

/**
* Get pg by Reference
*/
router.get('/:reference', async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  const format = req.query.format?req.query.format:'json';
  logger.debug(`${id}: findByReference on ${reference}`);
  try {
    const prosopography = await service.findByReference(reference);
    logger.debug(`${id}: findByReference done`);
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

/**
* Create pg in json format
*/
router.post('/', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST prosopography`);
  logger.debug(`${id}: POST prosopography user ${req.user.name}`);
  //FIXME : add controls via mongoose ? or swagger ?
  const proso = req.body;
  try{
    const result = await service.create(proso);
    return res.send({'message':'OK'});
  }catch(err){
    logger.debug(`${id}: POST prosopography ERROR ${err}`);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

/**
* Parse pg from text
*/
router.post('/parse-text', async (req, res) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST prosopography parse-text`);

  const proso = req.body;
  try{
    let p = await service.convertFromText(proso);
    logger.debug(`${id} POST prosopography parse-text : Parsing OK`);
    return res.send(p);
  }catch(err){
    logger.error(err);
    return res.status(500).json({
        message: "Error",
        error: err,
    });
  }
});

/**
* Delete by reference
*/
router.delete('/:reference', auth.isAdmin, async (req, res, next) => {
  const id = uuid.v4();
  const reference = req.params.reference;
  logger.debug(`${id}: deleteByReference on ${reference}`);
  try {
    await service.remove(reference);
    logger.debug(`${id}: deleteByReference done`);
    res.send({'message':'OK'});
  } catch (err) {
    logger.error(
      `${id}: Failed to delete with reference ${reference} - ${err}`
    );
    next(err);
  }
});


/**
* Handle prosopography creation from text format
* @deprecated

router.post('/create-from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST prosopography create-from-text`);
  logger.debug(`${id}: POST prosopography create-from-text user ${req.user.name}`);

  let proso = req.body.prosopography;
  //Auto Generate <1a> fragment
  let seq = await service.getCurrentReference();
  let ref = parseInt(seq.seq);
  proso = `<1a> ${ref} \n`+proso;
  logger.debug(proso);

  try{
    let p = await service.convertFromText(proso);
    const prosopography = await service.findByReference(p.reference);
    if(prosopography){
      logger.debug(`POST prosopography from-text : ERROR prosopography ${p.reference} already exists`);
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


@deprecated

router.post('/from-text', auth.isAuthenticated, async (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST prosopography from-text`);
  logger.debug(`${id}: POST prosopography from-text user ${req.user.name}`);

  const proso = req.body.prosopography;
  const reference = req.body.reference;
  logger.debug(proso);
  if(reference){
    logger.debug(`${id}: POST prosopography from-text update ${reference}`);
    try{
      let p = await service.convertFromText(proso);
      const prosopography = await service.findByReference(p.reference);
      if(prosopography){
        logger.debug(`${id}: POST prosopography from-text found ${prosopography.reference}`);
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
*/





export default router;
