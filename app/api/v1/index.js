import Router from 'koa-router';

import users from './users/router';

const instance = new Router();

export default instance
	.use(users.routes())
;
