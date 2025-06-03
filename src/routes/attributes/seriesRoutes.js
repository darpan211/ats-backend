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
    authorizeRoles('admin', 'superadmin'),
    createSeriesController
);
router.get(
    '/getseries',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getSeriesController
);
router.get(
    '/getseries/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getSeriesById
);
router.delete(
    '/deleteseries/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteSeriesController
);
router.put(
    '/updateseries/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateSeriesController
);

export default router;
