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
    authorizeRoles('admin'),
    createColorsController
);
router.get(
    '/getcolors',
    authenticateToken,
    authorizeRoles('admin'),
    getColorsController
);
router.get(
    '/getcolors/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getColorsById
);
router.delete(
    '/deletcolors/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteColorsController
);
router.put(
    '/updatecolors/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateColorsController
);

export default router;
