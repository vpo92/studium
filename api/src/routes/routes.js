import express from 'express';
import prosopographyRoutes from './prosopographyRoutes';

const router = express.Router();
router.use('/prosopography', prosopographyRoutes);

/** *********************
 * Export               *
 ************************
 */
export default router;
