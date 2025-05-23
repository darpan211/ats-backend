import Attribute from '../../models/attribute/category.model.js';
import { sendErrorResponse, sendSuccessResponse } from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';

export const createCategoryController = async (req, res) => {
    try {
        const { category } = req.body;

        const newCategory = new Attribute({ category });
        await newCategory.save();

        return sendSuccessResponse(
            res,
            newCategory,
            'Category added successfully'
        );
    } catch (error) {
        console.error('❌ Create Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getCategoryController = async (req, res) => {
    try {
        const CategoryController = await Attribute.find();
        return sendSuccessResponse(
            res,
            CategoryController,
            'category fetched successfully'
        );
    } catch (err) {
        console.error('Get category Error:', err);
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
        const updateData = req.body;

        const updateCategoryController = await Attribute.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updateCategoryController) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Category not found'
            );
        }
        return sendSuccessResponse(
            res,
            updateCategoryController,
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
