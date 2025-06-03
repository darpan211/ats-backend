import express from 'express';
import {
    createCategoryController,
    deleteCategoryController,
    getCategoryController,
    updateCategoryController,
    getCategoryById,
} from '../../controllers/attributes/categoryController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/addcategory',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    createCategoryController
);
router.get(
    '/getcategory',
    authenticateToken,
    authorizeRoles('admin', 'superadmin', 'seller', 'retailer'),
    getCategoryController
);
router.get(
    '/getcategory/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getCategoryById
);
router.delete(
    '/deletecategory/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteCategoryController
);
router.put(
    '/updatecategory/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    updateCategoryController
);

export default router;
