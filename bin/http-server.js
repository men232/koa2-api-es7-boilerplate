import path from 'path';
import Koa from 'koa';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import serve from 'koa-static';
import cors from '@koa/cors';
import config from 'config';
import _get from 'lodash/get';

import formaterMiddleware from 'middlewares/formater';
import reqIdMiddleware from 'middlewares/request-id';
import logMiddleware from 'middlewares/log';
import errorHandler from 'middlewares/error-handler';

import logger from 'lib/logger';

import 'models';

import apiV1 from 'api/v1';

const {
	host: HOST,
	port: PORT,
	proxy
} = config.httpServer;

const app = new Koa();
const log = logger(module, 'http-server');

app.proxy = !!proxy;
app.context.log = log;

app.use(mount('/docs', serve(path.resolve('docs'))));
app.use(mount('/public', serve(path.resolve('public'))));

app.use(cors());
app.use(koaLogger(log.info.bind(log)));
app.use(bodyParser());
app.use(reqIdMiddleware());
app.use(logMiddleware({ logger: log }));
app.use(formaterMiddleware({ resultKey: 'data' }));
app.use(errorHandler());

app.use(mount('/api/v1', apiV1.routes()));
// app.use(mount('/api/v2', apiV2.routes()));

app.removeAllListeners('error');
app.on('error', onError);

app.listen(PORT, HOST, function() {
	const { address, port } = this.address();
	const protocol = this.addContext ? 'https' : 'http';

	log.info(`Server started on %s://%s:%s`, protocol, address, port);
});

function onError(err, ctx) {
	// use context or http-server logger
	const logger = _get(ctx, 'log', log );
	const reqId = _get(ctx, 'requestId');
	const reqInfo = reqId ? ` on the request: ${reqId}` : '';

	logger.log('error', 'unhandled exception occured%s', reqInfo,
		{ err, event: 'error' }
	);
}

export default app;
