import * as Router from 'koa-router';
import { init, genToken } from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/init', async (ctx, next) => {
    const handler = (authURL: string) => {
        const html = renderHtml('./src/views/system.pug', { authURL });
        ctx.body = html;
    };

    await init(handler);
});

router.post('/init', async (ctx, next) => {
    const body = ctx.request.body;

    if (body) {
        const { code } = body as any;
        await genToken(code);
    }

    return ctx.redirect('/');
});

export { router };
