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
import namer from 'color-namer';
import { uploadToS3, deleteFromS3 } from '../services/s3Uploder.js';
import mongoose from 'mongoose';

const getImageColors = async (imagePath) => {
    try {
        const filePath = path.join(imagePath);
        const colors = await getColors(filePath);
        const majorityColorHex = colors[0].hex();
        const colorName = namer(majorityColorHex).basic[0].name; // You can use 'ntc', 'pantone', etc.
        return { color_code: majorityColorHex, color_name: colorName };
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
};

export const addTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        let {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
            status,
            thickness,
            finish,
            material
        } = req.body;
        const tiles_image = req.files;
        const parseToArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                // Remove quotes and split by comma
                return val.replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()).filter(Boolean);
            }
            return [];
        };

        series = parseToArray(series);
        suitable_place = parseToArray(suitable_place);
        size = parseToArray(size);
        finish = parseToArray(finish);
        material = parseToArray(material);

        // For tiles_name and thickness, handle as before
        const tilesName = parseToArray(tiles_name);
        const tilesThickness = parseToArray(thickness);
        const createdTiles = [];

        for (let i = 0; i < tiles_image.length; i++) {
            const image = tiles_image[i];
            const color = await getImageColors(image.path);
            const imageUrl = await uploadToS3(image);
            fs.unlinkSync(image.path);

            const tile = await Tiles.create({
                tiles_name: tilesName[i] || tilesName[0],
                description,
                series,
                category,
                suitable_place,
                size,
                tiles_color: [color],
                tiles_image: imageUrl,
                status,
                thickness: tilesThickness[i] || tilesThickness[0],
                finish,
                material,
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
        const tiles_image = req.file;
        // Only parse and add fields if they exist in req.body
        const parseToArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                return val.replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()).filter(Boolean);
            }
            return [];
        };

        const updateData = {};
        const fields = [
            'tiles_name',
            'description',
            'series',
            'category',
            'suitable_place',
            'size',
            'status',
            'thickness',
            'finish',
            'material',
            'favorite',
            'priority',
        ];

        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                // Parse array fields
                if (['series', 'suitable_place', 'size', 'finish', 'material'].includes(field)) {
                    updateData[field] = parseToArray(req.body[field]);
                } else if (field === 'favorite') {
                    const val = req.body[field];
                    updateData[field] = val === 'true' || val === true;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

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

export const getTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            tiles_name,
            description,
            series,
            category,
            suitable_place,
            size,
            status,
            favorite,
            color_name,
            finish,
            material,
            order = "desc",
            sort_by,
            page = 1,
            limit = 12
        } = req.query;

        const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (tiles_name) filter.tiles_name = { $regex: tiles_name, $options: 'i' };
        if (description) filter.description = { $regex: description, $options: 'i' };
        if (series) {
            if (Array.isArray(series)) {
                filter.series = { $in: series };
            } else {
                filter.series = { $elemMatch: { $regex: series, $options: 'i' } };
            }
        }
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (suitable_place) {
            if (Array.isArray(suitable_place)) {
                filter.suitable_place = { $in: suitable_place };
            } else {
                filter.suitable_place = { $elemMatch: { $regex: suitable_place, $options: 'i' } };
            }
        }
        if (size) {
            if (Array.isArray(size)) {
                filter.size = { $in: size };
            } else {
                filter.size = { $elemMatch: { $regex: size, $options: 'i' } };
            }
        }
        if (finish) {
            if (Array.isArray(finish)) {
                filter.finish = { $in: finish };
            } else {
                filter.finish = { $elemMatch: { $regex: finish, $options: 'i' } };
            }
        }
        if (material) {
            if (Array.isArray(material)) {
                filter.material = { $in: material };
            } else {
                filter.material = { $elemMatch: { $regex: material, $options: 'i' } };
            }
        }
        if (status) filter.status = status;
        if (favorite !== undefined) filter.favorite = favorite === 'true';
        if (color_name) filter['tiles_color.color_name'] = { $regex: color_name, $options: 'i' };

        const userFilter = { ...filter, created_by: new mongoose.Types.ObjectId(userId) };

        let tiles = [];
        let total = 0;

        if (sort_by === "name") {
            total = await Tiles.countDocuments(userFilter);
            tiles = await Tiles.aggregate([
                { $match: userFilter },
                { $sort: { tiles_name: 1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);
        } else if (sort_by === "priority") {
            const aggregatePipeline = [
                { $match: userFilter },
                {
                    $addFields: {
                        priorityOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$priority", "high"] }, then: 1 },
                                    { case: { $eq: ["$priority", "medium"] }, then: 2 },
                                    { case: { $eq: ["$priority", "low"] }, then: 3 }
                                ],
                                default: 4
                            }
                        }
                    }
                },
                { $sort: { priorityOrder: 1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ];

            const countPipeline = [
                { $match: userFilter },
                {
                    $addFields: {
                        priorityOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$priority", "high"] }, then: 1 },
                                    { case: { $eq: ["$priority", "medium"] }, then: 2 },
                                    { case: { $eq: ["$priority", "low"] }, then: 3 }
                                ],
                                default: 4
                            }
                        }
                    }
                },
                { $count: "total" }
            ];

            const countResult = await Tiles.aggregate(countPipeline);
            total = countResult[0]?.total || 0;
            tiles = await Tiles.aggregate(aggregatePipeline);
        } else {
            total = await Tiles.countDocuments(userFilter);
            tiles = await Tiles.find(userFilter)
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(parseInt(limit));
        }

        return sendSuccessResponse(res, {
            data: tiles,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        }, 'Tiles Get successfully');
    } catch (error) {
        console.error('Get Tiles Error:', error);
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

        // Helper to flatten nested arrays
        const flatten = (arr) => arr.reduce((acc, val) => acc.concat(val), []);

        // Get unique tile names
        const uniqueTilesName = [...new Set(seller_add_details.map(tile => tile.tiles_name).filter(Boolean))];

        const uniqueDescription = [...new Set(seller_add_details.map(tile => tile.description).filter(Boolean))];

        const uniqueCategories = [...new Set(seller_add_details.map(tile => tile.category).filter(Boolean))];

        // Flatten series arrays before deduplication
        const uniqueSeries = [
            ...new Set(flatten(seller_add_details.map(tile => tile.series || [])).filter(Boolean))
        ];

        const uniqueSize = [
            ...new Set(flatten(seller_add_details.map(tile => tile.size || [])).filter(Boolean))
        ];

        const uniqueSuitable_place = [
            ...new Set(flatten(seller_add_details.map(tile => tile.suitable_place || [])).filter(Boolean))
        ];

        const uniqueThickness = [
            ...new Set(seller_add_details.map(tile => tile.thickness).filter(Boolean))
        ];

        // Extract color_name from tiles_color array
        const uniqueColorNames = [
            ...new Set(
                flatten(seller_add_details.map(tile =>
                    (tile.tiles_color || []).map(color => color.color_name)
                )).filter(Boolean)
            )
        ];

        const uniqueFinish = [
            ...new Set(flatten(seller_add_details.map(tile => tile.finish || [])).filter(Boolean))
        ];

        const uniqueMaterial = [
            ...new Set(flatten(seller_add_details.map(tile => tile.material || [])).filter(Boolean))
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
                color: uniqueColorNames,
                finish: uniqueFinish,
                material: uniqueMaterial
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

export const uploadImage = async (req, res) => {
    try {
        const tiles_image = req.files;
        let colors = [];
        for (let i = 0; i < tiles_image.length; i++) {
            const image = tiles_image[i];
            const color = await getImageColors(image.path);
            colors.push(color)
            fs.unlinkSync(image.path);
        }
        return sendSuccessResponse(res, colors, 'Tiles color fetched successfully');
    } catch (error) {
        console.error('Get upload Image Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
}