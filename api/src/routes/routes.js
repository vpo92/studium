// @flow


import express from 'express';
const path = require('path');

import auth from '../services/authService';
auth.setup();

import prosopographyRoutes from './prosopographyRoutes';
import authRoutes from './authRoutes';
import cartoRoutes from './testCartoRoutes';
import userRoutes from './userRoutes';

const pkg = require("../../package.json");
const router = express.Router();
const mode = process.env.APP_MODE || 'dev';

router.use('/prosopography', prosopographyRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/carto', cartoRoutes);
router.get('/docs', (req,res) => {
    let p = mode === 'PROD'?'/app/docs/index.html':path.join(__dirname,"../../docs/index.html");
    res.sendFile(p);
  });
router.get('/data/:file', (req,res) => {
  let file = req.params.file+'.json';
  console.log(req.params.file);
  let p = mode === 'PROD'?'/app/resources/json/':path.join(__dirname,"../../resources/json/");
  res.sendFile(p+file);
});
router.use('/', (req,res) => {
    res.send({"message":"welcome to studium API", "version":pkg.version});
  });


/** *********************
 * Export               *
 ************************
 */
export default router;
