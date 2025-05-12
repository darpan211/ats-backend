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
