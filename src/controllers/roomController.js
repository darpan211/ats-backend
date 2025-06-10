import Room from '../models/room.modal.js';
import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../utils/helper.js';
import fs from 'fs';
import { uploadToRoomsS3, deleteFromS3 } from '../services/s3Uploder.js';
import { HTTPSTATUS } from '../utils/constants.js';

export const createRoom = async (req, res) => {
    try {
        const { template_name, category, room_type, status, description } =
            req.body;

        const upload_image = req.file;
        const imageUrl = await uploadToRoomsS3(upload_image);
        fs.unlinkSync(upload_image.path);
        const newRoom = new Room({
            template_name,
            category,
            room_type,
            status,
            description,
            upload_image: imageUrl,
        });

        await newRoom.save();
        return sendSuccessResponse(res, newRoom, 'Room created successfully');
    } catch (err) {
        console.error('Create Room Error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (req.file) {
            const findUrl = await Room.findById(id);
            await deleteFromS3(findUrl.upload_image);
            updateData.upload_image = await uploadToRoomsS3(req.file);
            fs.unlinkSync(req.file.path);
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedRoom) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Room not found'
            );
        }

        return sendSuccessResponse(
            res,
            updatedRoom,
            'Room updated successfully'
        );
    } catch (err) {
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRoom = await Room.findByIdAndDelete(id);
        if (!deletedRoom) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Room not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedRoom,
            'Room deleted successfully'
        );
    } catch (err) {
        console.error('Delete Room Error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(Room, {}, page, limit);
        return sendSuccessResponse(res, result, 'Rooms fetched successfully');
    } catch (err) {
        console.error('Get Rooms Error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Room not found'
            );
        }

        return sendSuccessResponse(res, room, 'Room fetched successfully');
    } catch (err) {
        console.error('Get Room Error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
