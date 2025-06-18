import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import sizesModel from '../../models/attribute/sizes.model.js';

export const createSizesController = async (req, res) => {
    try {
        const { height, width } = req.body;
        const sizes = `${height} X ${width}`;

        // Check if size already exists
        const existingSize = await sizesModel.findOne({ height, width });
        if (existingSize) {
            return sendErrorResponse(res, 400, 'This size already exists');
        }

        const newSizes = new sizesModel({ height, width, sizes });
        await newSizes.save();

        return sendSuccessResponse(res, newSizes, 'Sizes added successfully');
    } catch (error) {
        console.error('Create sizes Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getSizesController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit)
        const result = await paginate(sizesModel, {}, page, limit);
        return sendSuccessResponse(res, result, 'sizes fetched successfully');
    } catch (err) {
        console.error('Get sizes Error:', err);
    }
};
export const getSizesById = async (req, res) => {
    try {
        const { id } = req.params;
        const sizes = await sizesModel.findById(id);

        if (!sizes) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'sizes not found'
            );
        }

        return sendSuccessResponse(res, sizes, 'sizes fetched successfully');
    } catch (error) {
        console.error('Get sizes by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const deleteSizesController = async (req, res) => {
    try {
        console.log('deleteSizesController  hit');

        const { id } = req.params;

        const deletedSizes = await sizesModel.findByIdAndDelete(id);

        if (!deletedSizes) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'sizes not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedSizes,
            'sizes deleted successfully'
        );
    } catch (error) {
        console.error('sizes Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const updateSizesController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // If height or width is being updated, check for uniqueness
        if (updateData.height || updateData.width) {
            const existing = await sizesModel.findById(id);
            if (!existing) {
                return sendErrorResponse(
                    res,
                    HTTPSTATUS.notFound.code,
                    'size not found'
                );
            }

            const updatedHeight = updateData.height || existing.height;
            const updatedWidth = updateData.width || existing.width;

            // Check if another size with the same height and width exists
            const duplicate = await sizesModel.findOne({
                height: updatedHeight,
                width: updatedWidth,
                _id: { $ne: id },
            });
            if (duplicate) {
                return sendErrorResponse(res, 400, 'This size already exists');
            }

            updateData.sizes = `${updatedHeight} X ${updatedWidth}`;
        }

        const updatedSize = await sizesModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedSize) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'size not found'
            );
        }
        return sendSuccessResponse(
            res,
            updatedSize,
            'size updated successfully'
        );
    } catch (error) {
        console.error('Update size Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
