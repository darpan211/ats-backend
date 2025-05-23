import express from 'express';
import upload from '../utils/multerConfig.js';
import {
    createRoom,
    updateRoom,
    deleteRoom,
    getRooms,
    getRoomById,
} from '../controllers/roomController.js';

const router = express.Router();

router.post('/createroom', upload.single('upload_image'), createRoom);
router.put('/updateroom/:id', upload.single('upload_image'), updateRoom);
router.get('/getroom', getRooms);
router.delete('/deleteroom/:id', deleteRoom);

export default router;
