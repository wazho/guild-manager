import * as Router from 'koa-router';
import { stringify, parse } from 'qs';
import { passport } from '../libs/passport-line';
import { addUser } from '../libs/google-apis';
import { getCharData } from '../libs/maplestory-union-api';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));

router.get('/auth/line', passport.authenticate('line'));

router.get('/auth/line/callback', async (ctx, next) => {
    await passport.authenticate('line', async (err, lineProfile) => {
        if (!err && lineProfile) {
            // Encode LINE profile.
            const data = JSON.stringify({
                displayName: lineProfile.displayName,
                lineID: lineProfile.id,
                pictureURL: lineProfile.pictureUrl,
            });
            const token = Buffer.from(data, 'utf8').toString('hex');
            const querystring = stringify({ token });

            return ctx.redirect(`/register?${querystring}`);
        }

        return ctx.redirect('/login');
    })(ctx, next);
});

router.get('/admin', (ctx, next) => {
    try {
        const html = renderHtml('./src/views/admin.pug');
        ctx.body = html;
    } catch (e) {
        return ctx.redirect('/');
    }
});

router.post('/generate-invite-code', (ctx, next) => {
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

        const html = renderHtml('./src/views/invite-code.pug', { manager, player, inviteCode });
        ctx.body = html;
    }
});

router.get('/register', (ctx, next) => {
    try {
        // Decode LINE profile.
        const { token } = parse(ctx.querystring);
        const data = Buffer.from(token, 'hex').toString('utf8');
        const { displayName, lineID, pictureURL } = JSON.parse(data);

        const html = renderHtml('./src/views/register.pug', { displayName, lineID, pictureURL });
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
            await addUser({
                charName,
                displayName,
                manager,
                lineID,
                pictureURL,
                avatarURL: character && character.avatarURL,
                job: character && character.job,
            });

            return ctx.redirect('/users');
        }
    } catch (error) {
        return ctx.redirect('/');
    }
});

export { router };
