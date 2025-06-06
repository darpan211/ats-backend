import express from 'express';
import {
    createSizesController,
    deleteSizesController,
    getSizesController,
    updateSizesController,
    getSizesById,
} from '../../controllers/attributes/sizesController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/addsizes',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    createSizesController
);
router.get(
    '/getsizes',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getSizesController
);
router.get(
    '/getsizes/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getSizesById
);
router.delete(
    '/deletesizes/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteSizesController
);
router.put(
    '/updatesizes/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateSizesController
);

export default router;
