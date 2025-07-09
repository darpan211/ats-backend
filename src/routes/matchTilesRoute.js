import express from 'express';
import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
import {
    createMatchTiles,
    getmatchTiles,
    deleteMatchTiles,
    updateMatchTiles,
    getMatchTilesById,
} from '../controllers/matchTilesController.js';
const router = express.Router();

router.post(
    '/addmatchtiles',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    createMatchTiles
);

router.get(
    '/matchtiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getmatchTiles
);

router.delete(
    '/deletematchtiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    deleteMatchTiles
);

router.get(
    '/getmatchtiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getMatchTilesById
);

router.put(
    '/updatematchtiles/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    updateMatchTiles
);

export default router;
