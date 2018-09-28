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
    try {
        isLockRefreshing = true;

        const { lineProfiles, i } = state;

        // Decode token of LINE.
        const token = Buffer.from(lineProfiles[i].encodedToken, 'hex').toString('utf8');
        const { accessToken, refreshToken } = JSON.parse(token);

        const apiURL = 'https://api.line.me/v2/profile';
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        };

        const res = await fetch(apiURL, options);
        if (res.status === 200) {
            const { userId, displayName, pictureUrl } = await res.json();

            // Add user into storage.
            const rowNum = i + 2; // Index start from 1 and header row.
            const errorHandler = (error: any) => error && console.warn(error);

            await GoogleAPIs.updateLineProfile(rowNum, {
                lineID: userId,
                displayName: displayName,
                pictureURL: pictureUrl,
            } as any, errorHandler);

            console.log(`Updated LINE profile: ${userId} (Row: ${rowNum})`);
        }

        if (lineProfiles.length > i + 1) {
            this.schedule({ lineProfiles, i: i + 1 }, 1000);
        } else {
            isLockRefreshing = false;
            console.log(`This round for updating LINE profiles is done.`);
        }
    } catch (e) {
        isLockRefreshing = false;
        console.error(`Update LINE profile fail.`);
    }
}

export { router };
