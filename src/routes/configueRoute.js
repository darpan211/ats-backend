import express from 'express';
import upload from '../utils/multerConfig.js';
import {
    createMasterConfig,
    updateMasterConfig,
    deleteMasterConfig,
    getAllConfigs,
    getConfigById,
} from '../controllers/configureController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post(
    '/addslider',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    upload.any(),
    createMasterConfig
);
router.put(
    '/updateconfigure/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    upload.any(),
    updateMasterConfig
);
router.delete(
    '/deleteconfigure/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    deleteMasterConfig
);
router.get(
    '/getconfigure/:id',
    // authenticateToken,
    // authorizeRoles('admin', 'superadmin', 'seller'),
    getAllConfigs
);

router.get(
    '/getconfigure/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    getConfigById
);

export default router;
