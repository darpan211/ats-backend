import express from 'express';
import upload from '../utils/multerConfig.js';
import {
    addTiles,
    getTiles,
    getTilesById,
    deleteTiles,
    updateTiles,
} from '../controllers/tilesController.js';

const router = express.Router();

router.post('/addtiles', upload.single('tiles_image'), addTiles);
router.put('/updatetiles/:id', upload.single('tiles_image'), updateTiles);
router.get('/gettiles', getTiles);
router.get('/gettiles/:id', getTilesById);
router.delete('/deletetiles/:id', deleteTiles);

export default router;
