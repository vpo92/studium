import util from '../common/controller.util';
import db from '../common/db';
import logger from '../common/logger';

function findAll(req, res) {
  logger.info('findAll');
  db
    .get()
    .collection('prosopography')
    .find()
    .limit(50)
    .toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
}

function textSearch(req, res) {
  logger.info('textSearch');
  db
    .get()
    .collection('prosopography')
    .find(
      { $text: { $search: req.params.searchText } },
      { score: { $meta: 'textScore' },'reference':true,'identity':true}
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(50)
    .toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
}

function indexSearch(req, res) {
  logger.info('indexSearch');
  const letter = req.params.letter;
  const regex = new RegExp(`^${letter}`, 'g');
  db
    .get()
    .collection('prosopography')
    .find({ 'identity.name.value': { $regex: regex, $options: '-i' } },{'reference':true,'identity':true})
    .limit(0)
    .toArray()
    .then(util.handleData(res))
    .catch(util.handleError(res));
}

function findByReference(req, res) {
  logger.info('findByReference reference:' + req.params.reference);
  return db
    .get()
    .collection('prosopography')
    .findOne({ reference: parseInt(req.params.reference) })
    .then(function(results) {
      logger.info(results);
      res.statusCode = 200;
      res.json(results);
    })
    .catch(util.handleError(res));
}

/** *********************
 * Export               *
 ************************
 */
module.exports = {
  findAll,
  indexSearch,
  findByReference,
  textSearch,
};
