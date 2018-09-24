// Node modules.
import * as Router from 'koa-router';
// Local modules.
import { webAppURL } from '../config';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/', (ctx, next) => {
    try {
        const path = './src/views/admin/root.pug';
        const html = renderHtml(path);
        ctx.body = html;
    } catch (e) {
        console.log(e);
        return ctx.redirect('/');
    }
});

router.post('/invite-code', (ctx, next) => {
    const body = ctx.request.body;

    if (body) {
        // Generate inviteCode.
        const { manager, player } = body as any;
        const data = JSON.stringify({
            charName: player,
            manager,
        });

        if (!player || !manager) {
            ctx.status = 400;
            ctx.body = '錯誤的角色名稱';
            return;
        }

        const inviteCode = Buffer.from(data, 'utf8').toString('hex');

        const path = './src/views/admin/invite-code.pug';
        const html = renderHtml(path, { manager, player, inviteCode, webAppURL });
        ctx.body = html;
    }
});

export { router };
