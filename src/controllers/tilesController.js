import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../utils/helper.js';
import { HTTPSTATUS } from '../utils/constants.js';
import path from 'path';
import fs from 'fs';
import Tiles from '../models/tiles.model.js';
import getColors from 'get-image-colors';
import { uploadToS3, deleteFromS3 } from '../services/s3Uploder.js';

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
        const userId = req.user.userId;
        // Expecting tiles_name and thickness as arrays if multiple images
        let {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
            status,
            thickness,
        } = req.body;
        const tiles_image = req.files;
        const tilesName = tiles_name.split(',');
        const tilesThickness = thickness.split(',');
        const createdTiles = [];

        for (let i = 0; i < tiles_image.length; i++) {
            const image = tiles_image[i];
            const color = await getImageColors(image.path);
            console.log('tiles', color);
            const imageUrl = await uploadToS3(image);
            fs.unlinkSync(image.path);

            const tile = await Tiles.create({
                tiles_name: tilesName[i] || tilesName[0],
                description,
                series,
                category,
                suitable_place,
                size,
                tiles_color: color,
                tiles_image: imageUrl,
                status,
                thickness: tilesThickness[i] || tilesThickness[0],
                created_by: userId,
            });

            createdTiles.push(tile);
        }

        return sendSuccessResponse(
            res,
            createdTiles,
            'Tiles added successfully'
        );
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(Tiles, {}, page, limit);
        return sendSuccessResponse(res, result, 'Tiles fetched successfully');
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
        const tile = await Tiles.findById(id);
        if (!tile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Tiles not found'
            );
        }

        // 2. Delete all images from S3
        if (tile.tiles_image && tile.tiles_image.length > 0) {
            const imagesToDelete = Array.isArray(tile.tiles_image)
                ? tile.tiles_image
                : [tile.tiles_image];
            for (const imgUrl of imagesToDelete) {
                await deleteFromS3(imgUrl);
            }
        }

        // 3. Delete the tile from DB
        await Tiles.findByIdAndDelete(id);

        return sendSuccessResponse(
            res,
            tile,
            'Tiles and images deleted successfully'
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
            status,
            thickness,
        } = req.body;
        const tiles_image = req.file;

        const updateData = {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
            status,
            thickness,
        };

        if (tiles_image) {
            const oldTile = await Tiles.findById(id);
            if (
                oldTile &&
                oldTile.tiles_image &&
                oldTile.tiles_image.length > 0
            ) {
                const imagesToDelete = Array.isArray(oldTile.tiles_image)
                    ? oldTile.tiles_image
                    : [oldTile.tiles_image];
                for (const imgUrl of imagesToDelete) {
                    await deleteFromS3(imgUrl);
                }
            }

            const colorResponse = await getImageColors(tiles_image.path);
            const imageUrl = await uploadToS3(tiles_image);
            fs.unlinkSync(tiles_image.path);

            updateData.tiles_color = colorResponse;
            updateData.tiles_image = [imageUrl];
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

export const filterTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
        } = req.query;

        // Build dynamic filter object
        const filter = {};
        if (tiles_name)
            filter.tiles_name = { $regex: tiles_name, $options: 'i' };
        if (description)
            filter.description = { $regex: description, $options: 'i' };
        if (series) filter.series = { $regex: series, $options: 'i' };
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (suitable_place)
            filter.suitable_place = { $regex: suitable_place, $options: 'i' };
        if (size) filter.size = { $regex: size, $options: 'i' };

        const tiles = await Tiles.find(filter)
            .where('created_by')
            .equals(userId);

        if (tiles.length === 0) {
            return sendSuccessResponse(
                res,
                [],
                'No tiles found matching the filter criteria',
                200
            );
        }
        return sendSuccessResponse(res, tiles, 'Tiles filtered successfully');
    } catch (error) {
        console.error('Filter Tiles Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getFilteredTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const seller_add_details = await Tiles.find({ created_by: userId });

        if (!seller_add_details || seller_add_details.length === 0) {
            return sendSuccessResponse(res, [], 'No tiles found for the user');
        }

        const uniqueTilesName = [
            ...new Set(
                seller_add_details
                    .map((tile) => tile.tiles_name)
                    .filter(Boolean)
            ),
        ];
        const uniqueDescription = [
            ...new Set(
                seller_add_details
                    .map((tile) => tile.description)
                    .filter(Boolean)
            ),
        ];
        const uniqueCategories = [
            ...new Set(
                seller_add_details.map((tile) => tile.category).filter(Boolean)
            ),
        ];
        const uniqueSeries = [
            ...new Set(
                seller_add_details.map((tile) => tile.series).filter(Boolean)
            ),
        ];
        const uniqueSize = [
            ...new Set(
                seller_add_details.map((tile) => tile.size).filter(Boolean)
            ),
        ];
        const uniqueSuitable_place = [
            ...new Set(
                seller_add_details
                    .map((tile) => tile.suitable_place)
                    .filter(Boolean)
            ),
        ];
        const uniqueThickness = [
            ...new Set(
                seller_add_details.map((tile) => tile.thickness).filter(Boolean)
            ),
        ];

        return sendSuccessResponse(
            res,
            {
                tiles_name: uniqueTilesName,
                categories: uniqueCategories,
                series: uniqueSeries,
                description: uniqueDescription,
                size: uniqueSize,
                suitable_place: uniqueSuitable_place,
                thickness: uniqueThickness,
            },
            'Unique data fetched successfully'
        );
    } catch (error) {
        console.error('Get Filtered Tiles Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
