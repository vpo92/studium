'use strict';

const express = require('express');
const controller = require('./prosopography.controller');

const router = express.Router();

/**
Return all prosopography element
*/
router.get('/', controller.findAll);
router.get('/search/:searchText', controller.textSearch);
router.get('/index/:letter', controller.indexSearch);
router.get('/:reference', controller.findByReference);

module.exports = router;
