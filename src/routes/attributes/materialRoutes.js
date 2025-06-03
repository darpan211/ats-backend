import express from 'express';
import {
    createMaterialController,
    deleteMaterialController,
    getMaterialController,
    updateMaterialController,
    getMaterialById,
} from '../../controllers/attributes/materialController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';
const router = express.Router();
router.post(
    '/addmaterial',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    createMaterialController
);
router.get(
    '/getmaterial',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getMaterialController
);
router.get(
    '/getmaterial/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getMaterialById
);
router.delete(
    '/deletematerial/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteMaterialController
);
router.put(
    '/updatematerial/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateMaterialController
);

export default router;
