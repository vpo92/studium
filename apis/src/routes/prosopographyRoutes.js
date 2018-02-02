// @flow

import express from 'express';
import service from '../services/prosopographyService';

const router = express.Router();

router.get('/', service.findAll);
router.get('/search/:searchText', service.textSearch);
router.get('/index/:letter', service.indexSearch);
router.get('/:reference', service.findByReference);

module.exports = router;
