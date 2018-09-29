// Node modules.
import * as Router from 'koa-router';
// Local modules.
import { webAppURL } from '../config';
import { findMember } from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

async function levelIdentify(ctx: Router.IRouterContext, callback: any) {
    const { user } = ctx.state;
    const remoteUser = await findMember(user && user.lineID);

    if (remoteUser) {
        const legalLevels = ['公會長', '副會長'];

        if (legalLevels.includes(remoteUser.status)) {
            callback();
        } else {
            ctx.redirect('/');
        }
    } else {
        ctx.redirect('/login');
    }
}

router.get('/', async (ctx, next) => {
    await levelIdentify(ctx, () => {
        const path = './src/views/admin/root.pug';
        const html = renderHtml(path);
        ctx.body = html;
    });
});

router.post('/invite-code', async (ctx, next) => {
    await levelIdentify(ctx, () => {
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
});

export { router };
