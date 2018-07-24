import config from 'config';

const HTTP_LOG_LEVEL = config.httpServer.logLevel;

/**
 * Return middleware that attachs logger to context and
 * logs HTTP request/response.
 *
 * @param {Object}    options={}     Optional configuration.
 * @param {Object}    options.logger Logger instance of bunyan.
 * @return {Function} Koa middleware.
 */
export default function(options) {
	if (!options.logger) {
		throw new TypeError('options.logger required');
	}

	return logMiddleware.bind(null, options);
}

async function logMiddleware({ logger }, ctx, next) {
	const req = reqSerializer(ctx);

	logger.log(HTTP_LOG_LEVEL, 'request start for id: %s', ctx.requestId,
		{ req, event: 'request' }
	);

	try {
		await next();
	} catch (err) {
		logger.log('error', 'unhandled exception occured on the request: %s', ctx.requestId,
			{ req, err, event: 'error' }
		);

		throw err;
	}

	const res = resSerializer(ctx);

	logger.log(HTTP_LOG_LEVEL, 'response for id: %s', ctx.requestId,
		{ res, event: 'response' }
	);
}

function reqSerializer(ctx) {
	const req = ctx.request;

	return {
		method: req.method,
		path: req.path,
		url: req.url,
		requestId: ctx.requestId,
		headers: req.headers,
		protocol: req.protocol,
		ip: req.ips[0] || req.ip,
		query: req.query
	};
}

function resSerializer(ctx) {
	const res = ctx.response;

	return {
		requestId: ctx.requestId,
		statusCode: res.status,
		type: res.type,
		headers: res.headers,
		body: resBodySerializer(ctx)
	};
}

function resBodyType(body) {
	if (isStream(body)) {
		return 'stream';
	} else if (isBuffer(body)) {
		return `buffer`;
	}

	return typeof body;
}

function resBodySerializer(ctx) {
	const { payload, body, messages: errors } = ctx;
	const { code, ms } = payload || {};

	const type = resBodyType(body);

	return { code, ms, type, errors };
}

function isStream(stream) {
	return stream !== null &&
		typeof stream === 'object' &&
		typeof stream.pipe === 'function';
}

function isBuffer(buffer) {
	return Buffer.isBuffer(buffer);
}

function isArray(array) {
	return Array.isArray(array);
}
