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
    authorizeRoles('admin'),
    createMaterialController
);
router.get(
    '/getmaterial',
    authenticateToken,
    authorizeRoles('admin'),
    getMaterialController
);
router.get(
    '/getmaterial/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getMaterialById
);
router.delete(
    '/deletematerial',
    authenticateToken,
    authorizeRoles('admin'),
    deleteMaterialController
);
router.put(
    '/updatematerial',
    authenticateToken,
    authorizeRoles('admin'),
    updateMaterialController
);

export default router;
