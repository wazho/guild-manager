// Node modules.
import * as Router from 'koa-router';
// Local modules.
import { router as systemRouter } from './system';
import { router as adminRouter } from './admin';
import { router as loginRouter } from './login';
import { router as usersRouter } from './users';
import { renderHtml } from '../libs/render-html';

const indexRouter = new Router();

indexRouter.get('/', (ctx, next) => {
    const path = './src/views/index.pug';
    const html = renderHtml(path);
    ctx.body = html;
});

const router = new Router();

router
    .use('/', indexRouter.routes(), indexRouter.allowedMethods())
    .use('/system', systemRouter.routes(), systemRouter.allowedMethods())
    .use('/admin', adminRouter.routes(), adminRouter.allowedMethods())
    .use('/login', loginRouter.routes(), loginRouter.allowedMethods())
    .use('/users', usersRouter.routes(), usersRouter.allowedMethods());

export default router;
