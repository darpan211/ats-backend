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
    authorizeRoles('admin'),
    createSuitablePlaceController
);
router.get(
    '/getsuitablePlace',
    authenticateToken,
    authorizeRoles('admin'),
    getSuitablePlaceController
);
router.get(
    '/getsuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getSuitablePlaceById
);
router.delete(
    '/deletesuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteSuitablePlaceController
);
router.put(
    '/updatesuitablePlace/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateSuitablePlaceController
);

export default router;
