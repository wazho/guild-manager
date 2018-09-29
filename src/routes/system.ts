// Node modules.
import * as Router from 'koa-router';
import fetch from 'node-fetch';
import { async } from 'rxjs/internal/scheduler/async';
// Local modules.
import * as GoogleAPIs from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/init', async (ctx, next) => {
    const handler = (authURL: string) => {
        const path = './src/views/system/init.pug';
        const html = renderHtml(path, { authURL });
        ctx.body = html;
    };

    await GoogleAPIs.initialize(handler);
});

router.post('/init', async (ctx, next) => {
    const body = ctx.request.body;

    if (body) {
        const { code } = body as any;
        await GoogleAPIs.generateToken(code);
    }

    return ctx.redirect('/');
});

let isLockRefreshing = false;

router.post('/update-line-profiles', async (ctx, next) => {
    if (!isLockRefreshing) {
        const lineProfiles = await GoogleAPIs.getLineProfiles();
        async.schedule(refreshLineProfile, 0, { lineProfiles, i: 0 });
        ctx.body = 'starting';
    } else {
        ctx.body = 'already in progress';
    }
});

async function refreshLineProfile(this: any, state: any) {
    const errorHandler = (errorCode: string, error: any) => errorCode && console.warn(errorCode, error);

    const { lineProfiles, i } = state;
    const rowNum = i + 2; // Index start from 1 and header row.

    try {
        isLockRefreshing = true;

        // Decode token of LINE.
        const token = Buffer.from(lineProfiles[i].encodedToken, 'hex').toString('utf8');
        try {
            JSON.parse(token);
        } catch (e) {
            console.warn(`Cannot serialize toke of LINE: ${lineProfiles[i].lineID} (Row: ${rowNum})`);
            throw `ILLEGAL_LINE_TOKEN`;
        }
        const { accessToken, refreshToken } = JSON.parse(token);

        const apiURL = 'https://api.line.me/v2/profile';
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        };

        const res = await fetch(apiURL, options);
        const { userId, displayName, pictureUrl } = await res.json();

        if (res.status === 200) {
            // Add user into storage.
            await GoogleAPIs.updateLineProfile(rowNum, {
                lineID: userId,
                displayName: displayName,
                pictureURL: pictureUrl,
                failCount: 0,
            } as any, errorHandler);

            console.log(`Updated LINE profile: ${userId} (Row: ${rowNum})`);
        } else {
            await GoogleAPIs.updateLineProfile(rowNum, {
                failCount: parseInt(lineProfiles[i].failCount) + 1,
            } as any, errorHandler);

            console.log(`Fail to update LINE profile: ${lineProfiles[i].lineID} (Row: ${rowNum})`);
        }
    } catch (e) {
        isLockRefreshing = false;
        console.error(`Update LINE profile fail.`, e);
    } finally {
        if (lineProfiles.length > i + 1) {
            this.schedule({ lineProfiles, i: i + 1 }, 5000);
        } else {
            isLockRefreshing = false;
            console.log(`This round for updating LINE profiles is done.`);
        }
    }
}

export { router };
