// Node modules.
import * as Router from 'koa-router';
import { stringify } from 'qs';
// Local modules.
import { passport } from '../libs/passport-line';

const router = new Router();

router.get('/', (ctx, next) => ctx.redirect('/login/auth/line'));

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

            return ctx.redirect(`/users/register?${querystring}`);
        }

        return ctx.redirect('/login');
    })(ctx, next);
});

export { router };
