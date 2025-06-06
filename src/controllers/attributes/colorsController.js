import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import colorsModel from '../../models/attribute/colors.model.js';
export const createColorsController = async (req, res) => {
    try {
        const { colors } = req.body;

        // Check if the color already exists (case-insensitive)
        const existingColor = await colorsModel.findOne({
            colors: { $regex: `^${colors}$`, $options: 'i' },
        });
        if (existingColor) {
            return sendErrorResponse(res, 400, 'This color already exists');
        }

        const newColors = new colorsModel({ colors });
        await newColors.save();

        return sendSuccessResponse(res, newColors, 'colors added successfully');
    } catch (error) {
        console.error('Create colors Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getColorsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(colorsModel, {}, page, limit);
        return sendSuccessResponse(res, result, 'colors fetched successfully');
    } catch (err) {
        console.error('Get colors Error:', err);
    }
};

export const getColorsById = async (req, res) => {
    try {
        const { id } = req.params;
        const colors = await colorsModel.findById(id);

        if (!colors) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'colors not found'
            );
        }

        return sendSuccessResponse(res, colors, 'colors fetched successfully');
    } catch (error) {
        console.error('Get colors by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const deleteColorsController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedColors = await colorsModel.findByIdAndDelete(id);

        if (!deletedColors) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'colors not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedColors,
            'Colors deleted successfully'
        );
    } catch (error) {
        console.error('colors Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateColorsController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updateColorsController = await colorsModel.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updateColorsController) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'colors not found'
            );
        }
        return sendSuccessResponse(
            res,
            updateColorsController,
            'colors updated successfully'
        );
    } catch (error) {
        console.error('Update colors Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
