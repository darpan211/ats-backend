import express from 'express';
import authRoutes from './auth/auth.routes.js';
import roomRoutes from './roomRoutes.js';
import attributeRoutes from './attributes/categoryRoutes.js';
import seriesRoutes from './attributes/seriesRoutes.js';
import materialRoutes from './attributes/materialRoutes.js';
import sizesRoutes from './attributes/sizesRoutes.js';
import colorsRoutes from './attributes/colorsRoutes.js';
import suitablePlaceRoutes from '../routes/attributes/suitablePlaceRoutes.js';
import addTiles from './tilesRoutes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/attributes', attributeRoutes);
router.use('/series', seriesRoutes);
router.use('/material', materialRoutes);
router.use('/sizes', sizesRoutes);
router.use('/colors', colorsRoutes);
router.use('/suitablePlace', suitablePlaceRoutes);
router.use('/tiles', addTiles);

export default router;
