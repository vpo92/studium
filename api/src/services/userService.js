// @flow

import User from  '../models/userModel';
import logger from '../utils/logger';

/**
 * Creates a new user
 */
async function create(body){
  logger.info("userService.create")
  logger.info(`userService.create user ${body}`);
  let newUser = new User(body);
  return await newUser.save();
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  create,
};
