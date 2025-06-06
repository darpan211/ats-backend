import express from 'express';
import {
    createSuitablePlaceController,
    deleteSuitablePlaceController,
    getSuitablePlaceController,
    updateSuitablePlaceController,
    getSuitablePlaceById,
} from '../../controllers/attributes/suitablePlaceController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/addsuitablePlace',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    createSuitablePlaceController
);
router.get(
    '/getsuitablePlace',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getSuitablePlaceController
);
router.get(
    '/getsuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getSuitablePlaceById
);
router.delete(
    '/deletesuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteSuitablePlaceController
);
router.put(
    '/updatesuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateSuitablePlaceController
);

export default router;
