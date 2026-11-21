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
  logger.debug(`${id}:getUser`);
  try{
    const userEmail = req.user.email?req.user.email.trim().toLowerCase():null;
    const user = await User.findOneAsync({email:userEmail});
    // Ticket #10 : une restauration pouvait écraser ou supprimer le compte
    // de l'administrateur connecté ; l'accès à user.name avant le test de
    // nullité plantait en erreur 500 muette. Un compte introuvable est
    // désormais un simple 401 explicite.
    if (!user) {
      logger.warn(`${id}:getUser compte introuvable pour le jeton ${userEmail}`);
      return res.status(401).json({
        message: 'Compte introuvable : votre session référence un utilisateur qui '
          + 'n\'existe plus (une restauration a peut-être remplacé les comptes). '
          + 'Reconnectez-vous avec un compte existant.',
      });
    }
    logger.debug(`${id}:getUser user found ${user.name}`);
    req.user = user;
    next();
  }catch(err){
    return next(err);
  }
};

const hasRole = (roles) => {
  return async (req, res, next) => {
    logger.debug('hasRole'+roles);
    try{
      await getAuth(req, res, next);
      const userEmail = req.user.email?req.user.email.trim().toLowerCase():null;
      const user = await User.findOneAsync({email:userEmail});

      if (!user) {
        return res.status(401).json({
          message: 'Compte introuvable : reconnectez-vous avec un compte existant.',
        });
      }else{
        req.user = user;
      }

      const filteredArray = roles.filter(value => Array.isArray(user.role) && user.role.includes(value));
      if (!filteredArray.length) {
        logger.debug("hasRole : not granted");
        return res.status(403).send({message: 'Access denied.'});
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
    logger.debug("getRoleAdmin");
    if (!user || !Array.isArray(user.role) || !user.role.includes('admin')) {
      logger.debug("hasRole : not granted");
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
  logger.debug('authService.setup');
  let opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.auth.secrets.session;
  //opts.issuer = 'accounts.examplesoft.com';
  //opts.audience = 'yoursite.net';
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    //logger.info(`jwt_payload : ${jwt_payload}`);
    //logger.info(jwt_payload);
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
