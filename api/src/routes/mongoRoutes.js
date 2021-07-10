// @flow

import express from 'express';
import uuid from 'uuid';
import { Parser,  transforms } from 'json2csv';


//import passport from 'passport';

import mongoService from '../services/mongoService';
import logger from '../utils/logger';
import auth from '../services/authService';

const router = express.Router();
//auth.isAuthenticated,
router.post('/executeQuery',  (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: executeQuery`);
  //logger.debug(`${id}: executeQuery by user ${req.user.name}`);
  logger.debug(req.body);
  logger.debug(req.body.collection);
  //let query = JSON.parse(req.body);
  let query = req.body;
  logger.debug(query.collection);
  logger.debug(query.find);
  logger.debug(query.projection);
  logger.debug(query.skip);
  logger.debug(query.limit);
  logger.debug(query.format);
  mongoService.executeQuery(query.collection,query.find,query.projection,query.skip, query.limit)
    .then(function(results){
      logger.debug(`${id}: executeQuery OK count ${results.length}`);
        if(query.format ==="csv"){
          logger.debug(`${id}: executeQuery CSV conversion`);
          try {
            const parser = new Parser({ transforms: [ transforms.flatten({ objects: true, arrays: true })] });
            const csv = parser.parse(results);
            res.header('Content-Type', 'text/csv');
            res.send(csv);
          } catch (err) {
            logger.error(`${id}: Failed to executeQuery  - ${err}`);
            next(err);
          }


        }else{
          res.send(results);
        }
      })
    .catch(function(err){
      logger.error(`${id}: Failed to executeQuery  - ${err}`);
      next(err);
    });
});

export default router;
