import { sendErrorResponse, sendSuccessResponse } from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import materialModel from '../../models/attribute/material.model.js';

export const createMaterialController = async (req, res) => {
    try {
        const { material } = req.body;

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
        const materialController = await materialModel.find();
        return sendSuccessResponse(
            res,
            materialController,
            'material fetched successfully'
        );
    } catch (err) {
        console.error('Get material Error:', err);
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
        const updateData = req.body;

        const updateMaterialController = await materialModel.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updateMaterialController) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'material not found'
            );
        }
        return sendSuccessResponse(
            res,
            updateMaterialController,
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
