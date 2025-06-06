import Attribute from '../../models/attribute/category.model.js';
import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';

export const createCategoryController = async (req, res) => {
    try {
        const { category } = req.body;

        // Check if the category already exists (case-insensitive)
        const existingCategory = await Attribute.findOne({
            category: { $regex: `^${category}$`, $options: 'i' },
        });
        if (existingCategory) {
            return sendErrorResponse(res, 400, 'This category already exists');
        }

        const newCategory = new Attribute({ category });
        await newCategory.save();

        return sendSuccessResponse(
            res,
            newCategory,
            'Category added successfully'
        );
    } catch (error) {
        console.error('Create Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getCategoryController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(Attribute, {}, page, limit);
        return sendSuccessResponse(
            res,
            result,
            'category fetched successfully'
        );
    } catch (err) {
        console.error('Get category Error:', err);
    }
};
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Attribute.findById(id);

        if (!category) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Category not found'
            );
        }

        return sendSuccessResponse(
            res,
            category,
            'Category fetched successfully'
        );
    } catch (error) {
        console.error('Get Category by ID Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const deleteCategoryController = async (req, res) => {
    try {
        console.log('deleteCategoryController hit');

        const { id } = req.params;

        const deletedCategory = await Attribute.findByIdAndDelete(id);

        if (!deletedCategory) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Category not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedCategory,
            'Category deleted successfully'
        );
    } catch (error) {
        console.error('Delete Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        let { category, ...rest } = req.body;

        if (category) {
            // Normalize spaces
            category = category.trim().replace(/\s+/g, ' ');
            const existingCategory = await Attribute.findOne({
                category: { $regex: `^${category}$`, $options: 'i' },
                _id: { $ne: id },
            });
            if (existingCategory) {
                return sendErrorResponse(
                    res,
                    400,
                    'This category already exists'
                );
            }
        }

        const updateData = category ? { category, ...rest } : { ...rest };

        const updatedCategory = await Attribute.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedCategory) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Category not found'
            );
        }
        return sendSuccessResponse(
            res,
            updatedCategory,
            'category updated successfully'
        );
    } catch (error) {
        console.error('Update category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
