// Node modules.
import * as Router from 'koa-router';
import { parse } from 'qs';
// Local modules.
import { findMember, getMembersData, addMember, MemberStatus } from '../libs/google-apis';
import { getCharData } from '../libs/maplestory-union-api';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/', async (ctx, next) => {
    const { user } = ctx.state;
    const remoteUser = await findMember(user && user.lineID);

    if (remoteUser) {
        const legalLevels = [MemberStatus.公會長, MemberStatus.副會長, MemberStatus.會員];

        if (legalLevels.includes(remoteUser.status)) {
            const { members, lastUpdated } = await getMembersData();
            const path = './src/views/users/root.pug';
            const html = renderHtml(path, { members, lastUpdated });
            ctx.body = html;
        } else {
            ctx.redirect('/');
        }
    } else {
        ctx.redirect('/login');
    }
});

router.get('/declaration', (ctx, next) => {
    try {
        const { inviteCode } = parse(ctx.querystring);
        const invitationData = Buffer.from(inviteCode, 'hex').toString('utf8');
        const { charName, manager } = JSON.parse(invitationData);

        if (!charName || !manager) {
            ctx.status = 400;
            ctx.body = '錯誤的邀請碼';
            return;
        }

        const path = './src/views/users/declaration.pug';
        const html = renderHtml(path, { inviteCode, charName, manager });
        ctx.body = html;
    } catch (e) {
        return ctx.redirect('/');
    }
});

router.get('/register', (ctx, next) => {
    try {
        // Decode LINE profile.
        const { code } = parse(ctx.querystring);
        const data = Buffer.from(code, 'hex').toString('utf8');
        const { displayName, pictureURL } = JSON.parse(data);

        const path = './src/views/users/register.pug';
        const html = renderHtml(path, { displayName, code });
        ctx.body = html;
    } catch (e) {
        return ctx.redirect('/');
    }
});

router.post('/register', async (ctx, next) => {
    try {
        const body = ctx.request.body;

        if (body) {
            // Decode inviteCode and code.
            const { inviteCode, code } = body as any;

            const invitationData = Buffer.from(inviteCode, 'hex').toString('utf8');
            const { charName, manager } = JSON.parse(invitationData);

            const userData = Buffer.from(code, 'hex').toString('utf8');
            const { displayName, lineID, pictureURL, token } = JSON.parse(userData);
            const { accessToken, refreshToken } = token;

            if (!charName || !manager) {
                ctx.status = 400;
                ctx.body = '錯誤的邀請碼';
                return;
            }

            if (!displayName || !lineID || !accessToken || !refreshToken) {
                ctx.status = 400;
                ctx.body = '無法取得 LINE 用戶資訊';
                return;
            }

            // Parse the character data.
            const character = await getCharData(charName);

            // Encode LINE token.
            const data = JSON.stringify(token);
            const encodedToken = Buffer.from(data, 'utf8').toString('hex');

            // Add user into storage.
            await addMember({
                charName,
                displayName,
                status: MemberStatus.會員,
                manager,
                lineID,
                pictureURL,
                avatarURL: character && character.avatarURL,
                job: character && character.job,
                level: character && parseInt(character.level),
                unionLevel: character && parseInt(character.unionLevel),
            }, {
                lineID,
                displayName,
                pictureURL,
                encodedToken,
            }, async (error: any) => {
                if (!error) {
                    await ctx.logIn({ id: lineID });
                }
            });

            return ctx.redirect('/');
        }
    } catch (error) {
        return ctx.redirect('/');
    }
});

export { router };
