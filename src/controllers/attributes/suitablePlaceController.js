import { sendErrorResponse, sendSuccessResponse } from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import suitablePlaceModel from '../../models/attribute/suitablePlace.model.js';

export const createSuitablePlaceController = async (req, res) => {
    try {
        const { suitablePlace } = req.body;

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
        const newsuitablePlace = await suitablePlaceModel.find();

        if (!newsuitablePlace || newsuitablePlace.length === 0) {
            return res.status(400).json({
                success: false,
                errorCode: 400,
                message: 'suitablePlace not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'suitablePlace fetched successfully',
            data: newsuitablePlace,
        });
    } catch (err) {
        console.error('Get suitablePlace Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
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
