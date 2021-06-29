// @flow

import passport from 'passport';
import {Strategy as JwtStrategy,ExtractJwt} from 'passport-jwt';
import logger from '../utils/logger';
import User from '../models/userModel';
import config from '../../config';
import uuid from 'uuid';

const getAuth = passport.authenticate('jwt', { session: false });
const getUser = async (req,res,next) => {
  const id = uuid.v4();
  logger.info(`${id}:getUser`);
  try{
    const userEmail = req.user.email?req.user.email.trim().toLowerCase():null;
    const user = await User.findOneAsync({email:userEmail});
    logger.info(`${id}:getUser user found ${user.name}`);
    if (!user) {
      return res.status(401).end();
    }else{
      req.user = user;
      next();
    }
  }catch(err){
    return next(err);
  }
};

const hasRole = (roles) => {
  return async (req, res, next) => {
    console.log('hasRole'+roles);
    try{
      await getAuth(req, res, next);
      const userEmail = req.user.email?req.user.email.trim().toLowerCase():null;
      const user = await User.findOneAsync({email:userEmail});

      if (!user) {
        return res.status(401).end();
      }else{
        req.user = user;
      }

      const filteredArray = roles.filter(value => user.role.includes(value));
      if (filteredArray == []) {
        console.log("hasRole : not granted");
        return res.status(403).send({error: { status:403, message:'Access denied.'}});
      }
      next();
    }catch(err){
      return next(err);
    }
  }
}

const getRoleAdmin = async (req,res,next) => {
  try{
    let user = req.user;
    console.log("getRoleAdmin");
    if (!user || !user.role.includes('admin')) {
      console.log("hasRole : not granted");
      return res.status(403).send({error: { status:403, message:'Access denied.'}});
    }
    next();
  }catch(err){
    return next(err);
  }
}

const isAuthenticated = [
  getAuth, getUser
]

const isAdmin = [getAuth, getUser, getRoleAdmin];

const authenticate = async (email, password)  => {
  try{
    const user = await User.findOneAsync({email:email.trim().toLowerCase()});
    if(await user.authenticate(password)){
      return user;
    }else{
      throw('Authentication failed : Wrong username password');
    }

  }catch(err){
    throw(err);
  }
};

const setup = () => {
  logger.info('authService.setup');
  let opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.auth.secrets.session;
  //opts.issuer = 'accounts.examplesoft.com';
  //opts.audience = 'yoursite.net';
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    logger.info(`jwt_payload : ${jwt_payload}`);
    logger.info(jwt_payload);
    //FIXME return user
    return done(null,{email:jwt_payload.email});
  }));
};

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  setup,
  authenticate,
  isAuthenticated,
  getUser,
  hasRole,
  isAdmin,
  getRoleAdmin,
};
