import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import { HTTPSTATUS } from '../utils/constants.js';
import path from 'path';
import fs from 'fs';
import Tiles from '../models/tiles.model.js';
import getColors from 'get-image-colors';
import { uploadToS3 } from '../services/s3Uploder.js';

const getImageColors = async (imagePath) => {
    try {
        const filePath = path.join(imagePath);
        const colors = await getColors(filePath);
        const majorityColor = colors[0].hex();
        return majorityColor;
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
};

export const addTiles = async (req, res) => {
    try {
        const {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
        } = req.body;
        const tiles_image = req.file;
        const colorResponse = await getImageColors(tiles_image.path);
        const imageUrl = await uploadToS3(tiles_image);
        fs.unlinkSync(tiles_image);
        await Tiles.create({
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
            tiles_color: colorResponse,
            tiles_image: imageUrl,
        });

        return sendSuccessResponse(res, 'Tiles added successfully');
    } catch (error) {
        console.error('Add Tiles Error', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getTiles = async (req, res) => {
    try {
        const tiles = await Tiles.find();
        return sendSuccessResponse(res, tiles, 'Tiles fetched successfully');
    } catch (error) {
        console.error('Get Tiles Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getTilesById = async (req, res) => {
    try {
        const { id } = req.params;
        const tiles = await Tiles.findById(id);
        if (!tiles) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Tiles not found'
            );
        }
        return sendSuccessResponse(res, tiles, 'Tiles fetched successfully');
    } catch (error) {
        console.error('Get Tiles by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const deleteTiles = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTiles = await Tiles.findByIdAndDelete(id);
        if (!deletedTiles) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Tiles not found'
            );
        }
        return sendSuccessResponse(
            res,
            deletedTiles,
            'Tiles deleted successfully'
        );
    } catch (error) {
        console.error('Delete Tiles Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateTiles = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
        } = req.body;
        const tiles_image = req.file;

        const updateData = {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
        };

        if (tiles_image) {
            const colorResponse = await getImageColors(tiles_image.path);
            const imageUrl = await uploadToS3(tiles_image);
            fs.unlinkSync(tiles_image);
            updateData.tiles_color = colorResponse;
            updateData.tiles_image = imageUrl;
        }

        const updatedTiles = await Tiles.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedTiles) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Tiles not found'
            );
        }

        return sendSuccessResponse(
            res,
            updatedTiles,
            'Tiles updated successfully'
        );
    } catch (error) {
        console.error('Update Tiles Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
