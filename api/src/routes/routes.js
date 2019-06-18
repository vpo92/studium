// @flow


import express from 'express';
const path = require('path');

import auth from '../services/authService';
auth.setup();

import prosopographyRoutes from './prosopographyRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const pkg = require("../../package.json");
const router = express.Router();
router.use('/prosopography', prosopographyRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.get('/docs', (req,res) => {
    res.sendFile(path.join(__dirname+"../../../docs/index.html"));
  });
router.get('/data/:file', (req,res) => {
  let file = req.params.file+'.json';
  console.log(req.params.file);
  res.sendFile(path.join(__dirname+"../../../resources/json/"+file));
});
router.use('/', (req,res) => {
    res.send({"message":"welcome to studium API", "version":pkg.version});
  });


/** *********************
 * Export               *
 ************************
 */
export default router;
