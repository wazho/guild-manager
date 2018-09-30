// Node modules.
import * as Router from 'koa-router';
import { stringify } from 'qs';
// Local modules.
import { passport } from '../libs/passport-line';
import { findMember } from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));

router.get('/logout', (ctx, next) => {
    ctx.logout();
    ctx.redirect('/');
});

router.get('/auth/line', passport.authenticate('line'));

router.get('/auth/line/callback', async (ctx, next) => {
    await passport.authenticate('line', async (err, lineProfile, token) => {
        if (!err && lineProfile) {
            console.log(`Someone logged-in by LINE (${lineProfile.displayName}, ${lineProfile.id}).`);

            const user = await findMember(lineProfile.id);

            // Is member already.
            if (user) {
                ctx.logIn(lineProfile, (err: any) => next());
                return ctx.redirect('/');
            }

            // Encode LINE profile.
            const data = JSON.stringify({
                displayName: lineProfile.displayName,
                lineID: lineProfile.id,
                pictureURL: lineProfile.pictureUrl,
                token,
            });
            const code = Buffer.from(data, 'utf8').toString('hex');
            const querystring = stringify({ code });

            return ctx.redirect(`/members/register?${querystring}`);
        }

        return ctx.redirect('/login');
    })(ctx, next);
});

export { router };
