// Node modules.
import * as _ from 'lodash';
import * as Router from 'koa-router';
import { parse } from 'qs';
// Local modules.
import {
    MemberStatus,
    findMember,
    getMembersData,
    getTeamsData,
    addMember,
    updateMoodPhrase,
} from '../libs/google-apis';
import { getCharData } from '../libs/maplestory-union-api';
import { renderHtml } from '../libs/render-html';
import { statusAuth, isStatusLegal } from '../middlewares/status-auth';

const router = new Router();

router.get('/', async (ctx, next) => {
    const simple = !await isStatusLegal(ctx);

    const { members, lastUpdated } = await getMembersData();

    const statistics = {
        avgLevel: _.meanBy(members, (o) => o.level),
    };

    const path = './src/views/users/roster.pug';
    const html = renderHtml(path, { simple, members, lastUpdated });
    ctx.body = html;
});

router.get('/teams', statusAuth, async (ctx, next) => {
    const { teams, lastUpdated } = await getTeamsData();
    const path = './src/views/users/teams.pug';
    const html = renderHtml(path, { teams, lastUpdated });
    ctx.body = html;
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

router.post('/mood-phrase', statusAuth, async (ctx, next) => {
    try {
        const { user } = ctx.state;
        const remoteUser = await findMember(user && user.lineID);
        const body = ctx.request.body;

        if (remoteUser && body) {
            // Decode inviteCode and code.
            const { moodPhrase } = body as any;

            await updateMoodPhrase(remoteUser.lineID, moodPhrase, (e: any) => {
                e && console.warn(e);
            });

            ctx.status = 200;
            ctx.message = 'succeeded';
        } else {
            throw 'ERR_UPDATE_MOOD_PHRASE';
        }
    } catch (error) {
        ctx.status = 400;
        ctx.message = 'fail to update mood phrase.';
    }
});

export { router };
