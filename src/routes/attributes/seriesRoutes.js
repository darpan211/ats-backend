import express from 'express';
import {
    createSeriesController,
    getSeriesController,
    deleteSeriesController,
    updateSeriesController,
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
