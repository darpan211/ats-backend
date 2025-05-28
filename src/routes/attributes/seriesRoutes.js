import express from 'express';
import {
    createSeriesController,
    getSeriesController,
    deleteSeriesController,
    updateSeriesController,
    getSeriesById,
} from '../../controllers/attributes/seriesController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/addseries',
    authenticateToken,
    authorizeRoles('admin'),
    createSeriesController
);
router.get(
    '/getseries',
    authenticateToken,
    authorizeRoles('admin'),
    getSeriesController
);
router.get(
    '/getseries/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getSeriesById
);
router.delete(
    '/deleteseries/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteSeriesController
);
router.put(
    '/updateseries/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateSeriesController
);

export default router;
