// Node modules.
import * as Router from 'koa-router';
// Local modules.
import { router as systemRouter } from './system';
import { router as adminRouter } from './admin';
import { router as loginRouter } from './login';
import { router as membersRouter } from './members';
import { renderHtml } from '../libs/render-html';

const indexRouter = new Router();

indexRouter.get('/', (ctx, next) => {
    const { user } = ctx.state;

    const path = './src/views/index.pug';
    const html = renderHtml(path, { user });

    ctx.body = html;
});

const router = new Router();

router
    .use('/', indexRouter.routes(), indexRouter.allowedMethods())
    .use('/system', systemRouter.routes(), systemRouter.allowedMethods())
    .use('/admin', adminRouter.routes(), adminRouter.allowedMethods())
    .use(loginRouter.routes(), loginRouter.allowedMethods())
    .use('/members', membersRouter.routes(), membersRouter.allowedMethods());

export default router;
