// @flow

import passport from 'passport';
import {Strategy as JwtStrategy,ExtractJwt} from 'passport-jwt';
import logger from '../utils/logger';
import User from '../models/userModel';
import config from '../../config';

const authenticate = async (email, password)  => {
  try{
    const user = await User.findOneAsync({email:email.toLowerCase()});
    await user.authenticate(password);
    return user;
  }catch(err){
    throw(err);
  }
};

const setup = () => {
  logger.info('authService.setup');
  let opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.auth.secrets.session;;
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
};
