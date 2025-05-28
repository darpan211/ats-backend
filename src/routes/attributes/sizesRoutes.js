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
    authorizeRoles('admin'),
    createSizesController
);
router.get(
    '/getsizes',
    authenticateToken,
    authorizeRoles('admin'),
    getSizesController
);
router.get(
    '/getsizes/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getSizesById
);
router.delete(
    '/deletesizes/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteSizesController
);
router.put(
    '/updatesizes/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateSizesController
);

export default router;
