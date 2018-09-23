import * as Router from 'koa-router';
import { router as lineLoginRouter } from './line-login';
import { router as usersRouter } from './users';

import { renderHtml } from '../libs/render-html';

const indexRouter = new Router();

indexRouter.get('/', (ctx, next) => {
    const html = renderHtml('./src/views/index.pug');
    ctx.body = html;
});

export {
    indexRouter,
    lineLoginRouter,
    usersRouter,
};
