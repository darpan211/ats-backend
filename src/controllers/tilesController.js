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
import { uploadToS3, deleteFromS3,uploadUrlToS3 } from '../services/s3Uploder.js';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
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
            material,
            qr_urls
        } = req.body;

        const tiles_image = req.files;

        const parseToArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                return val.replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()).filter(Boolean);
            }
            return [];
        };

        series = parseToArray(series);
        suitable_place = parseToArray(suitable_place);
        size = parseToArray(size);
        finish = parseToArray(finish);
        material = parseToArray(material);
        const tilesName = parseToArray(tiles_name);
        const tilesThickness = parseToArray(thickness);
        const qrUrls = parseToArray(qr_urls);

        const createdTiles = [];

        for (let i = 0; i < tiles_image.length; i++) {
            const image = tiles_image[i];
            const color = await getImageColors(image.path);
            const imageUrl = await uploadToS3(image);
            fs.unlinkSync(image.path);

            let qrImageUrl = '';
            if (qrUrls[i]) {
                // Generate QR Code as base64
                const qrDataUrl = await QRCode.toDataURL(qrUrls[i]);
                const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                qrImageUrl = await uploadUrlToS3({
                    buffer,
                    originalname: `qr_tile_${Date.now()}_${i}.png`,
                    mimetype: 'image/png'
                });
            }
            
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
                qr_url: qrUrls[i] || null,
                qr_image: qrImageUrl || null
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
            'qr_url'
        ];

        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
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

        const oldTile = await Tiles.findById(id);
        if (!oldTile) {
            return sendErrorResponse(res, HTTPSTATUS.notFound.code, 'Tiles not found');
        }

        if (tiles_image) {
            if (oldTile.tiles_image) {
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

        if (req.body.qr_url && req.body.qr_url !== oldTile.qr_url) {
            // Delete old QR image from S3 if present
            if (oldTile.qr_image) {
                await deleteFromS3(oldTile.qr_image);
            }

            // Generate new QR code from new URL
            const qrDataUrl = await QRCode.toDataURL(req.body.qr_url);
            const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Upload QR image buffer to S3
            const qrImageUrl = await uploadToS3({
                buffer,
                originalname: `qr_tile_${Date.now()}.png`,
                mimetype: 'image/png'
            });

            updateData.qr_image = qrImageUrl;
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

const normalizeToArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return val;
};

export const getTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            tiles_name,
            description,
            series,
            categories,
            suitable_place,
            sizes,
            status,
            favorite,
            colors,
            finishes,
            materials,
            order = "desc",
            sort_by,
            priority,
            page = 1,
            limit
        } = req.query;

        // Normalize array-like query params
        const size = normalizeToArray(sizes);
        const color_name = normalizeToArray(colors);
        const finish = normalizeToArray(finishes);
        const material = normalizeToArray(materials);
        const category = normalizeToArray(categories);
        const normalizedSeries = normalizeToArray(series);
        const normalizedSuitablePlace = normalizeToArray(suitable_place);

        const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;
        const parsedLimit = parseInt(limit);
        const useLimit = !isNaN(parsedLimit) && parsedLimit > 0;
        const skip = useLimit ? (parseInt(page) - 1) * parsedLimit : 0;

        // Build filter object
        const filter = {};
        if (tiles_name) filter.tiles_name = { $regex: tiles_name, $options: 'i' };
        if (description) filter.description = { $regex: description, $options: 'i' };
        if (normalizedSeries) {
            if (Array.isArray(normalizedSeries)) {
                filter.series = { $in: normalizedSeries };
            } else {
                filter.series = { $elemMatch: { $regex: normalizedSeries, $options: 'i' } };
            }
        }
        if (category) {
            if (Array.isArray(category)) {
                filter.$or = category.map(cat => ({
                    category: { $regex: cat, $options: 'i' }
                }));
            } else {
                filter.category = { $regex: category, $options: 'i' };
            }
        }
        if (normalizedSuitablePlace) {
            if (Array.isArray(normalizedSuitablePlace)) {
                filter.suitable_place = { $in: normalizedSuitablePlace };
            } else {
                filter.suitable_place = { $elemMatch: { $regex: normalizedSuitablePlace, $options: 'i' } };
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
        if (priority) filter.priority = { $regex: priority, $options: 'i' };
        if (color_name) {
            if (Array.isArray(color_name)) {
                filter.$or = color_name.map(color => ({
                    'tiles_color.color_name': { $regex: color, $options: 'i' }
                }));
            } else {
                filter['tiles_color.color_name'] = { $regex: color_name, $options: 'i' };
            }
        }

        filter.created_by = new mongoose.Types.ObjectId(userId);

        let tiles = [];
        let total = 0;

        if (sort_by === "name") {
            total = await Tiles.countDocuments(filter);
            const pipeline = [
                { $match: filter },
                { $sort: { tiles_name: 1 } },
                { $skip: skip }
            ];
            if (useLimit) pipeline.push({ $limit: parsedLimit });
            tiles = await Tiles.aggregate(pipeline);
        } else if (sort_by === "priority") {
            const aggregatePipeline = [
                { $match: filter },
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
                { $skip: skip }
            ];
            if (useLimit) aggregatePipeline.push({ $limit: parsedLimit });

            const countPipeline = [
                { $match: filter },
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
            total = await Tiles.countDocuments(filter);
            let query = Tiles.find(filter)
                .sort({ createdAt: sortOrder })
                .skip(skip);
            if (useLimit) query = query.limit(parsedLimit);
            tiles = await query;
        }

        return sendSuccessResponse(res, {
            data: tiles,
            currentPage: parseInt(page),
            totalPages: useLimit ? Math.ceil(total / parsedLimit) : 1,
            totalItems: total,
        }, 'Tiles fetched successfully');
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
