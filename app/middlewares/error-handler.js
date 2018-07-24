import { HttpError } from 'http-errors';
import { UNKNOWN_ERROR } from 'constants/app-errors';

import AppError from 'errors/AppError';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_STRICT = NODE_ENV !== 'development';

const STATUS_CODES = {
	100: 'CONTINUE',
	200: 'OK',
	201: 'CREATED',
	202: 'ACCEPTED',
	204: 'NO_CONTENT',
	400: 'BAD_REQUEST',
	401: 'UNAUTHORIZED',
	403: 'FORBIDDEN',
	404: 'NOT_FOUND',
	408: 'REQUEST_TIMEOUT',
	422: 'UNPROCESSABLE_ENTITY',
	500: 'INTERNAL_SERVER_ERROR',
	501: 'NOT_IMPLEMENTED',
	502: 'BAD_GATEWAY',
	503: 'SERVICE_UNAVAILABLE',
	504: 'GATEWAY_TIME_OUT'
};

/**
 * Return middleware that handle exceptions in Koa.
 * Dispose to the first middleware.
 *
 * @return {Function}
 */
export default function() {
	return errorHandlerMiddleware;
}

async function errorHandlerMiddleware(ctx, next) {
	try {
		await next();

		// Respond 404 Not Found for unhandled request
		if (!ctx.body && (!ctx.status || ctx.status === 404)) {
			throw 'UNKNOWN_ENDPOINT';
		}
	} catch (err) {
		const { errMsgs, errCode, errStatus, handled } = errorHandler(err);

		if (!handled) {
			ctx.app.emit('error', err, ctx);
		}

		ctx.status = errStatus || UNKNOWN_ERROR.status;
		ctx.payload.code = errCode;
		ctx.payload.error = true;
		ctx.payload.message = errMsgs[0];
		ctx.payload.messages = errMsgs;
	}
}

function errorHandler(err) {
	let errMsgs = [UNKNOWN_ERROR.message];
	let errCode  = UNKNOWN_ERROR.code;
	let errStatus  = UNKNOWN_ERROR.status;

	let handled = true;

	// transofrm to AppError;
	if (typeof err === 'string') {
		err = new AppError(err);
	} else if (err instanceof HttpError) {
		err = new AppError('UNKNOWN_ERROR', err.message, err.statusCode);
		err.code = STATUS_CODES[err.statusCode] || err.code;
	} else if (err.name === 'ValidationError') {
		const msgs = extractMongooseError(err);
		err = new AppError('INVALID_REQUEST', msgs);
	} else if (err.name === 'JsonWebTokenError') {
		err = new AppError('TOKEN_VALIDATION_ERROR', err.message);
	} else if (err.name === 'TokenExpiredError') {
		err = new AppError('TOKEN_EXPIRED_ERROR', err.message);
	} else if (!IS_STRICT) {
		err = new AppError('UNKNOWN_ERROR', `[HIDDEN_ON_PROD]: ${err.message}`);
		handled = false;
	}

	// Handling error
	if (err.name === 'AppError') {
		errMsgs = err.messages;
		errCode = err.code;
		errStatus = err.statusCode;
	} else {
		handled = false;
	}

	return { errMsgs, errCode, errStatus, handled };
}

function extractMongooseError(err) {
	const result = {};

	Object.keys(err.errors).forEach(key => {
		result[key] = err.errors[key].message;
	});

	return result;
}
