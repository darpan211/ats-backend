import express from 'express';
import {
    createColorsController,
    deleteColorsController,
    getColorsController,
    updateColorsController,
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
    deleteColorsController
);
router.delete(
    '/deletcolors/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getColorsController
);
router.put(
    '/updatecolors/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateColorsController
);

export default router;
