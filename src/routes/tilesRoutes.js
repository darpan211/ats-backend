import express from 'express';
import upload from '../utils/multerConfig.js';
import {
    addTiles,
    getTiles,
    getTilesById,
    deleteTiles,
    updateTiles,
    filterTiles,
    getFilteredTiles,
} from '../controllers/tilesController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post(
    '/addtiles',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    upload.array('tiles_image', 100),
    addTiles
);
router.put(
    '/updatetiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    upload.array('tiles_image', 100),
    updateTiles
);
router.get(
    '/gettiles',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getTiles
);
router.get(
    '/gettiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getTilesById
);
router.delete(
    '/deletetiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    deleteTiles
);
router.get(
    '/filter',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    filterTiles
);
router.get(
    '/getfilteredtiles',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getFilteredTiles
);

export default router;
