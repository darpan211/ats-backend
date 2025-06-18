import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import materialModel from '../../models/attribute/material.model.js';

export const createMaterialController = async (req, res) => {
    try {
        const { material } = req.body;
        // Check if the material already exists (case-insensitive)
        const existingMaterial = await materialModel.findOne({
            material: { $regex: `^${material}$`, $options: 'i' },
        });
        if (existingMaterial) {
            return sendErrorResponse(res, 400, 'This material already exists');
        }

        const newMaterial = new materialModel({ material });
        await newMaterial.save();

        return sendSuccessResponse(
            res,
            newMaterial,
            'Material added successfully'
        );
    } catch (error) {
        console.error('Create Material Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getMaterialController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit)
        const result = await paginate(materialModel, {}, page, limit);
        return sendSuccessResponse(
            res,
            result,
            'material fetched successfully'
        );
    } catch (error) {
        console.error('Get material Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.Error.code,
            HTTPSTATUS.serverError.Error.message
        );
    }
};

export const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await materialModel.findById(id);
        if (!material) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Material not found'
            );
        }
        return sendSuccessResponse(
            res,
            material,
            'Material fetched successfully'
        );
    } catch (error) {
        console, error('Get material by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.Error.code,
            HTTPSTATUS.serverError.Error.message
        );
    }
};
export const deleteMaterialController = async (req, res) => {
    try {
        console.log('deleteSeriesController  hit');

        const { id } = req.params;

        const deletedMaterial = await materialModel.findByIdAndDelete(id);

        if (!deletedMaterial) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'material not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedMaterial,
            'material deleted successfully'
        );
    } catch (error) {
        console.error('material Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateMaterialController = async (req, res) => {
    try {
        const { id } = req.params;
        let { material, ...rest } = req.body;

        if (material) {
            // Normalize spaces
            material = material.trim().replace(/\s+/g, ' ');
            const existingMaterial = await materialModel.findOne({
                material: { $regex: `^${material}$`, $options: 'i' },
                _id: { $ne: id },
            });
            if (existingMaterial) {
                return sendErrorResponse(
                    res,
                    400,
                    'This material already exists'
                );
            }
        }

        const updateData = material ? { material, ...rest } : { ...rest };

        const updatedMaterial = await materialModel.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedMaterial) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'material not found'
            );
        }
        return sendSuccessResponse(
            res,
            updatedMaterial,
            'material updated successfully'
        );
    } catch (error) {
        console.error('Update material Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
