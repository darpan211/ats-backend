import express from 'express';
import {
    createCategoryController,
    deleteCategoryController,
    getCategoryController,
    updateCategoryController,
} from '../../controllers/attributes/categoryController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/addcategory',
    authenticateToken,
    authorizeRoles('admin'),
    createCategoryController
);
router.get(
    '/getcategory',
    authenticateToken,
    authorizeRoles('admin'),
    getCategoryController
);
router.delete(
    '/deletecategory/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteCategoryController
);
router.put(
    '/updatecategory/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateCategoryController
);

export default router;
