// Node modules.
import * as Router from 'koa-router';
// Local modules.
import { webAppURL } from '../config';
import { findMember, MemberStatus, getMembersData } from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

async function levelIdentify(ctx: Router.IRouterContext, next: any) {
    const { user } = ctx.state;
    const remoteUser = await findMember(user && user.lineID);

    if (remoteUser) {
        const legalLevels = [MemberStatus.公會長, MemberStatus.副會長];

        if (legalLevels.includes(remoteUser.status)) {
            await next();
        } else {
            return ctx.redirect('/');
        }
    } else {
        return ctx.redirect('/login');
    }
}

router.get('/', levelIdentify, async (ctx, next) => {
    const { user } = ctx.state;

    const path = './src/views/admin/index.pug';
    const html = renderHtml(path, { user });
    ctx.body = html;
});

router.get('/invite-code', levelIdentify, async (ctx, next) => {
    const { user } = ctx.state;

    const path = './src/views/admin/invite-code.pug';
    const html = renderHtml(path, { user });
    ctx.body = html;
});

router.post('/invite-code', levelIdentify, async (ctx, next) => {
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

        const path = './src/views/admin/invitation.pug';
        const html = renderHtml(path, { manager, player, inviteCode, webAppURL });
        ctx.body = html;
    }
});

router.get('/teams-management', levelIdentify, async (ctx, next) => {
    const { user } = ctx.state;

    const availableLevels = [MemberStatus.公會長, MemberStatus.副會長, MemberStatus.會員];

    const { members: allMembers } = await getMembersData();
    const members = allMembers.filter((member) => availableLevels.includes(member.status));

    const path = './src/views/admin/teams-management.pug';
    const html = renderHtml(path, { user, members });
    ctx.body = html;
});

export { router };
