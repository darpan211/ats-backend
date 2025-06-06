import express from 'express';
import {
    createColorsController,
    deleteColorsController,
    getColorsController,
    updateColorsController,
    getColorsById,
} from '../../controllers/attributes/colorsController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';
const router = express.Router();
router.post(
    '/addcolors',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller'),
    createColorsController
);
router.get(
    '/getcolors',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getColorsController
);
router.get(
    '/getcolors/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getColorsById
);
router.delete(
    '/deletecolors/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteColorsController
);
router.put(
    '/updatecolors/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateColorsController
);

export default router;
