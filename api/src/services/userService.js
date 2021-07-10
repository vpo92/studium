// @flow

import User from  '../models/userModel';
import logger from '../utils/logger';

/**
 * Creates a new user
 */
async function create(body){
  logger.debug("userService.create");
  logger.debug(`userService.create user ${body}`);
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
  logger.debug("userService.findAll");
  return await User.find({},{_id:1,name:1,email:1,role:1});
}

/**
* Remove an User
*/
async function remove(userId){
  logger.debug("userService.remove");
  return await User.deleteOne({_id:userId});
}


/**
* Update Pwd of an User
*/
async function initPwd(userId, newPwd){
  logger.debug("userService.initPwd");
  let cUser = await User.findOne({_id:userId}).exec();
  let user = new User(cUser);
  user.password = newPwd;
  return await user.save();


  //return await User.updateOne({_id:userId},{$set:{password: newUser.encryptPassword(newPwd)}});
}
/** *********************
 * Export               *
 ************************
 */
module.exports = {
  create, findAll,remove, initPwd
};
