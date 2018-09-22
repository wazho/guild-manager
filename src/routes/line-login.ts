import * as Router from 'koa-router';
import { passport } from '../libs/passport-line';
import { addUser } from '../libs/google-apis';

const router = new Router();

router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));

router.get('/auth/line', passport.authenticate('line'));

router.get('/auth/line/callback', (ctx, next) => {
    passport.authenticate('line', (err, lineProfile) => {
        addUser({
            charName: 'temp1',
            displayName: lineProfile.displayName,
            manager: 'temp2',
            lineID: lineProfile.id,
            pictureURL: lineProfile.pictureUrl,
        });
    })(ctx, next);

    return ctx.redirect('/');
});

export { router };
