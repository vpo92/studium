// @flow

import User from  '../models/userModel';
import logger from '../utils/logger';

/**
 * Creates a new user
 */
async function create(body){
  logger.info("userService.create");
  logger.info(`userService.create user ${body}`);
  let newUser = new User(body);
  if(newUser.email){
    newUser.email = newUser.email.trim().toLowerCase()
  }
  return await newUser.save();
}

/**
* Find All User
*/
async function findAll(){
  logger.info("userService.findAll");
  return await User.find({},{_id:1,name:1,email:1,role:1});
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  create, findAll
};
