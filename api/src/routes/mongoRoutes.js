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
  logger.info(`${id}: executeQuery`);
  //logger.info(`${id}: executeQuery by user ${req.user.name}`);
  logger.info(req.body);
  logger.info(req.body.collection);
  //let query = JSON.parse(req.body);
  let query = req.body;
  logger.info(query.collection);
  logger.info(query.find);
  logger.info(query.projection);
  logger.info(query.skip);
  logger.info(query.limit);
  logger.info(query.format);
  mongoService.executeQuery(query.collection,query.find,query.projection,query.skip, query.limit)
    .then(function(results){
      logger.info(`${id}: executeQuery OK count ${results.length}`);
        if(query.format ==="csv"){
          logger.info(`${id}: executeQuery CSV conversion`);
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
