// @flow

import express from 'express';
import uuid from 'uuid';
//import passport from 'passport';

import userService from '../services/userService';
import logger from '../utils/logger';
import auth from '../services/authService';

const router = express.Router();

router.post('/', (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: createUser`);
  userService.create(req.body)
    .then(function(user){
      logger.info(`${id}: createUser user : ${user}`);
      res.send({message:"OK"});
      })
    .catch(function(err){
      logger.error(`${id}: Failed to create userService - ${err}`);
      next(err);
    });
});

router.get('/me',auth.isAuthenticated, (req, res, next) => {
  const id = uuid.v4();
  logger.info(`${id}: GET me from-text user ${req.user.name}`);
  const profile = {
    _id: req.user.id,
    name : req.user.name,
    email: req.user.email,
    role : req.user.role,
  };
  res.send(profile);
});

export default router;
