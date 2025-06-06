import {
    sendErrorResponse,
    sendSuccessResponse,
    paginate,
} from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';
import seriesModel from '../../models/attribute/series.model.js';

const normalizeSeries = (str) => str.trim().replace(/\s+/g, ' ');

export const createSeriesController = async (req, res) => {
    try {
        const { series } = req.body;

        const existingSeries = await seriesModel.findOne({
            series: { $regex: `^${series}$`, $options: 'i' },
        });
        if (existingSeries) {
            return sendErrorResponse(res, 400, 'This series already exists');
        }

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await paginate(seriesModel, {}, page, limit);
        return sendSuccessResponse(res, result, 'series fetched successfully');
    } catch (err) {
        console.error('Get series Error:', err);
    }
};
export const getSeriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const series = await seriesModel.findById(id);
        if (!series) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Series not found'
            );
        }
        return sendSuccessResponse(res, series, 'Series fetched successfully');
    } catch (error) {
        console.error('Get series by ID Error:', error);
        return sendErrorResponse(
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.server.message
        );
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
        let { series, ...rest } = req.body;

        // If series is being updated, check for uniqueness
        if (series) {
            series = normalizeSeries(series);
            const existingSeries = await seriesModel.findOne({
                series: { $regex: `^${series}$`, $options: 'i' },
                _id: { $ne: id },
            });
            if (existingSeries) {
                return sendErrorResponse(
                    res,
                    400,
                    'This series already exists'
                );
            }
        }

        const updateData = series ? { series, ...rest } : { ...rest };

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
