import db from '../utils/db';
import logger from '../utils/logger';

const readPagination = function(pagination){

  if(pagination == null || (pagination && pagination.rows === -1)){
    return {
      "skip" : 0,
      "limit" : 0,
    }
  }

  let page = (pagination && pagination.page?pagination.page:1);
  let rows = (pagination && pagination.rows?pagination.rows:50);

  return {
    "skip" : (page-1)*rows,
    "limit" : rows,
  }

}

async function getLogs(pagination){
  logger.debug("logService.getLogs()");
  const pg = readPagination(pagination);

  return await db
      .get()
      .collection('logs')
      .find()
      .sort({timestamp: -1})
      .skip(pg.skip)
      .limit(pg.limit)
      .toArray();
}

async function clearLogs(n){
  logger.debug("logService.clearLogs()");

  return await db
      .get()
      .collection('logs')
      .drop();
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  getLogs,
  clearLogs
};
