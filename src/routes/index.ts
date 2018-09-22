import * as Router from 'koa-router';
import { router as lineLoginRouter } from './line-login';

const indexRouter = new Router();

indexRouter.get('/', (ctx, next) => {
    ctx.body = '<a href="/login">Login</a>';
});

export {
    indexRouter,
    lineLoginRouter,
};
