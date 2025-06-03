import express from 'express';
import upload from '../utils/multerConfig.js';
import {
    createRoom,
    updateRoom,
    deleteRoom,
    getRooms,
    getRoomById,
} from '../controllers/roomController.js';
import {
    authenticateToken,
    authorizeRoles,
} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post(
    '/createroom',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('upload_image'),
    createRoom
);
router.put(
    '/updateroom/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('upload_image'),
    updateRoom
);
router.get(
    '/getroom',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getRooms
);
router.get(
    '/getroom/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getRoomById
);
router.delete(
    '/deleteroom/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteRoom
);

export default router;
