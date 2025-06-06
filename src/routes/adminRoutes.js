import express from 'express';
import {
    createAdmin,
    getAllUser,
    getAdminById,
    updateUser,
    deleteUser,
} from '../controllers/adminController.js';

import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post(
    '/createuser',
    authenticateToken,
    authorizeRoles('admin'),
    createAdmin
);

router.get('/getuser', authenticateToken, authorizeRoles('admin'), getAllUser);
router.get(
    '/getuser/:id',
    authenticateToken,
    authorizeRoles('admin'),
    getAdminById
);
router.put(
    '/updateuser/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateUser
);
router.delete(
    '/deleteuser/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteUser
);
export default router;
