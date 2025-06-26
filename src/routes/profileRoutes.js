import express from 'express';
import upload from '../utils/multerConfig.js';
import {
  getProfile,
  updateprofile
} from '../controllers/profileController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get(
    '/getprofile/:id',
    authenticateToken,
    authorizeRoles('admin', 'seller'),
    getProfile
);
router.put(
    '/updateprofile/:id',
    authenticateToken,
    authorizeRoles('admin', 'seller'),
    upload.single('profile_image'),
    updateprofile
);


export default router;
