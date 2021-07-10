// @flow

import express from 'express';
import uuid from 'uuid';
//import passport from 'passport';

import userService from '../services/userService';
import logger from '../utils/logger';
import auth from '../services/authService';

const router = express.Router();

router.post('/', auth.isAdmin, (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: POST /user`);
  userService.create(req.body)
    .then(function(user){
      logger.debug(`${id}: POST /user : ${user}`);
      res.send({message:"OK"});
      })
    .catch(function(err){
      logger.error(`${id}: Failed to create userService - ${err}`);
      next(err);
    });
});

router.get('/me',auth.isAuthenticated, (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET /me user ${req.user.name}`);
  const profile = {
    _id: req.user.id,
    name : req.user.name,
    email: req.user.email,
    role : req.user.role,
  };
  res.send(profile);
});

router.get('/', auth.isAuthenticated, (req, res, next) => {
  const id = uuid.v4();
  logger.debug(`${id}: GET / all users`);
  userService.findAll()
  .then(user => {res.send(user)})
  .catch(error => {next(error)});
});

//FIXME : is root OR userId = connectedUserId
router.post('/init-pwd/:userId', auth.isAdmin, (req, res, next) => {
  const id = uuid.v4();
  const userId = req.params.userId;
  logger.debug(`${id}: POST /init-pwd for user ${userId}`);
  userService.initPwd(userId,req.body.newPwd)
  .then(user => {res.send({message:'OK'})})
  .catch(error => {
    logger.error(
      `${id}: Failed to init-pwd with userId ${userId} - ${error}`
    );
    next(error);
  });
});

router.delete('/:userId', auth.isAdmin, (req, res, next) => {
  const id = uuid.v4();
  const userId = req.params.userId;
  logger.debug(`${id}: DELETE /user ${userId}`);
  userService.remove(userId)
  .then(user => {res.send({message:'OK'})})
  .catch(error => {next(error)});
});


export default router;
