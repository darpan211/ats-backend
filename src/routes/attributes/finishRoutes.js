import express from 'express';
import {
    createFinishController,
    getFinishController,
    getFinishById,
    deleteFinishController,
    updateFinishController,
} from '../../controllers/attributes/finishController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';
const router = express.Router();
router.post(
    '/addfinish',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    createFinishController
);
router.get(
    '/getfinish',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getFinishController
);
router.get(
    '/getfinish/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getFinishById
);
router.delete(
    '/deletefinish/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteFinishController
);
router.put(
    '/updatefinish/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateFinishController
);

export default router;
