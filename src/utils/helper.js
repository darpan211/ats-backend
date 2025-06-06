import httpStatus from 'http-status';

export const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

// Custom Function for Handing Error and Success Messages for User [email, phone, GST]

export const successResponse = (data, message = null) => ({
    success: true,
    message,
    data,
});

export const errorResponse = (errorCode, message = null) => ({
    success: false,
    errorCode,
    message,
});

export const sendSuccessResponse = (res, data = [], message = null) => {
    return res.status(httpStatus.OK).send(successResponse(data, message));
};

export const sendErrorResponse = (res, errorCode = 500, message = null) => {
    return res.status(errorCode).send(errorResponse(errorCode, message));
};

export const paginate = async (
    Model,
    query = {},
    page,
    limit,
    projection = null,
    options = { sort: { createdAt: -1 } }
) => {
    try {
        const skip = (page - 1) * limit;
        const total = await Model.countDocuments(query);
        const data = await Model.find(query, projection, options)
            .skip(skip)
            .limit(limit);
        return {
            data,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        };
    } catch (error) {
        console.error('Pagination Error:', error);
        throw new Error('Pagination failed');
    }
};
