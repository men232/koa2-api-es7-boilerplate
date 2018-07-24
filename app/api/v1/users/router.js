import Router from 'koa-router';

import * as users from './users.controller';

const router = new Router({ prefix: '/users' });

router
	.get('/', users.getUsers)
;

export default router;
