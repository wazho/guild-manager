// Node modules.
import * as Router from 'koa-router';
import { parse } from 'qs';
// Local modules.
import { getUsers, addUser } from '../libs/google-apis';
import { getCharData } from '../libs/maplestory-union-api';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/', async (ctx, next) => {
    const users = await getUsers();

    const path = './src/views/users/root.pug';
    const html = renderHtml(path, { users });
    ctx.body = html;
});

router.get('/register', (ctx, next) => {
    try {
        // Decode LINE profile.
        const { token } = parse(ctx.querystring);
        const data = Buffer.from(token, 'hex').toString('utf8');
        const { displayName, lineID, pictureURL } = JSON.parse(data);

        const path = './src/views/users/register.pug';
        const html = renderHtml(path, { displayName, lineID, pictureURL });
        ctx.body = html;
    } catch (e) {
        return ctx.redirect('/');
    }
});

router.post('/register', async (ctx, next) => {
    try {
        const body = ctx.request.body;

        if (body) {
            // Decode inviteCode.
            const { inviteCode, displayName, lineID, pictureURL } = body as any;
            const data = Buffer.from(inviteCode, 'hex').toString('utf8');
            const { charName, manager } = JSON.parse(data);

            if (!charName || !manager) {
                ctx.status = 400;
                ctx.body = '錯誤的邀請碼';
                return;
            }

            if (!displayName || !lineID) {
                ctx.status = 400;
                ctx.body = '無法取得 LINE 用戶資訊';
                return;
            }

            // Parse the character data.
            const character = await getCharData(charName);

            // Add user into storage.
            const errorHandler = (error: any) => console.warn(error);
            await addUser({
                charName,
                displayName,
                manager,
                lineID,
                pictureURL,
                avatarURL: character && character.avatarURL,
                job: character && character.job,
            }, errorHandler);

            return ctx.redirect('/users');
        }
    } catch (error) {
        return ctx.redirect('/');
    }
});

export { router };
