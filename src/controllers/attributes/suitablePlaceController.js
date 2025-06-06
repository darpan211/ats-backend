import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import suitablePlaceModel from '../../models/attribute/suitablePlace.model.js';

export const createSuitablePlaceController = async (req, res) => {
    try {
        const { suitablePlace } = req.body;

        // Check if the suitablePlace already exists (case-insensitive)
        const existingPlace = await suitablePlaceModel.findOne({
            suitablePlace: { $regex: `^${suitablePlace}$`, $options: 'i' },
        });
        if (existingPlace) {
            return sendErrorResponse(
                res,
                400,
                'This suitablePlace already exists'
            );
        }

        const newSuitablePlace = new suitablePlaceModel({ suitablePlace });
        await newSuitablePlace.save();

        return sendSuccessResponse(
            res,
            newSuitablePlace,
            'suitablePlace added successfully'
        );
    } catch (error) {
        console.error('Create suitablePlace Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getSuitablePlaceController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(suitablePlaceModel, {}, page, limit);

        if (!result || result.length === 0) {
            return res.status(400).json({
                success: false,
                errorCode: 400,
                message: 'suitablePlace not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'suitablePlace fetched successfully',
            data: result,
        });
    } catch (err) {
        console.error('Get suitablePlace Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};
export const getSuitablePlaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const suitablePlace = await suitablePlaceModel.findById(id);

        if (!suitablePlace) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'suitablePlace not found'
            );
        }

        return sendSuccessResponse(
            res,
            suitablePlace,
            'suitablePlace fetched successfully'
        );
    } catch (error) {
        console.error('Get suitablePlace by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const deleteSuitablePlaceController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSuitablePlace =
            await suitablePlaceModel.findByIdAndDelete(id);

        if (!deletedSuitablePlace) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'suitablePlace not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedSuitablePlace,
            'suitablePlace deleted successfully'
        );
    } catch (error) {
        console.error('suitablePlace Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const updateSuitablePlaceController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updateSuitablePlaceController =
            await suitablePlaceModel.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            });

        if (!updateSuitablePlaceController) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'suitablePlace not found'
            );
        }
        return sendSuccessResponse(
            res,
            updateSuitablePlaceController,
            'suitablePlace updated successfully'
        );
    } catch (error) {
        console.error('Update suitablePlace Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
