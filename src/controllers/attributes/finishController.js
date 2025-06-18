import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import finishModel from '../../models/attribute/finish.model.js';
export const createFinishController = async (req, res) => {
    try {
        const { finish } = req.body;

        // Check if the color already exists (case-insensitive)
        const existingFinish = await finishModel.findOne({
            finish: { $regex: `^${finish}$`, $options: 'i' },
        });
        if (existingFinish) {
            return sendErrorResponse(res, 400, 'This finish already exists');
        }

        const newFinish = new finishModel({ finish });
        await newFinish.save();

        return sendSuccessResponse(res, newFinish, 'finish added successfully');
    } catch (error) {
        console.error('Create finish Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getFinishController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit)
        const result = await paginate(finishModel, {}, page, limit);
        return sendSuccessResponse(res, result, 'finish fetched successfully');
    } catch (err) {
        console.error('Get finish Error:', err);
    }
};

export const getFinishById = async (req, res) => {
    try {
        const { id } = req.params;
        const finish = await finishModel.findById(id);

        if (!finish) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'finish not found'
            );
        }

        return sendSuccessResponse(res, finish, 'finish fetched successfully');
    } catch (error) {
        console.error('Get finish by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const deleteFinishController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFinish = await finishModel.findByIdAndDelete(id);

        if (!deletedFinish) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'finish not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedFinish,
            'finish deleted successfully'
        );
    } catch (error) {
        console.error('finish Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateFinishController = async (req, res) => {
    try {
        const { id } = req.params;
        let { finish, ...rest } = req.body;

        if (finish) {
            // Normalize spaces
            finish = finish.trim().replace(/\s+/g, ' ');
            const existingFinish = await finishModel.findOne({
                finish: { $regex: `^${finish}$`, $options: 'i' },
                _id: { $ne: id },
            });
            if (existingFinish) {
                return sendErrorResponse(
                    res,
                    400,
                    'This finish already exists'
                );
            }
        }

        const updateData = finish ? { finish, ...rest } : { ...rest };

        const updatedFinish = await finishModel.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedFinish) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'finish not found'
            );
        }
        return sendSuccessResponse(
            res,
            updatedFinish,
            'finish updated successfully'
        );
    } catch (error) {
        console.error('Update finish Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
