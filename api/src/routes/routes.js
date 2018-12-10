// @flow

import express from 'express';
import auth from '../services/authService';
auth.setup();

import prosopographyRoutes from './prosopographyRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router = express.Router();
router.use('/prosopography', prosopographyRoutes);
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

/** *********************
 * Export               *
 ************************
 */
export default router;
