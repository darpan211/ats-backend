import { sendErrorResponse, sendSuccessResponse } from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import seriesModel from '../../models/attribute/series.model.js';

export const createSeriesController = async (req, res) => {
    try {
        const { series } = req.body;

        const newSeries = new seriesModel({ series });
        await newSeries.save();

        return sendSuccessResponse(res, newSeries, 'Series added successfully');
    } catch (error) {
        console.error('Create series Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getSeriesController = async (req, res) => {
    try {
        const SeriesCantroller = await seriesModel.find();
        return sendSuccessResponse(
            res,
            SeriesCantroller,
            'series fetched successfully'
        );
    } catch (err) {
        console.error('Get series Error:', err);
    }
};
export const deleteSeriesController = async (req, res) => {
    try {
        console.log('deleteSeriesController  hit');

        const { id } = req.params;

        const deletedSeries = await seriesModel.findByIdAndDelete(id);

        if (!deletedSeries) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'series not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedSeries,
            'Series deleted successfully'
        );
    } catch (error) {
        console.error('series Category Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateSeriesController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedSeries = await seriesModel.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedSeries) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Series not found'
            );
        }

        return sendSuccessResponse(
            res,
            updatedSeries,
            'Series updated successfully'
        );
    } catch (error) {
        console.error('Update series Error:', error);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
