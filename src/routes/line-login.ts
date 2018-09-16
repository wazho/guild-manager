import * as Router from 'koa-router';
import { passport } from '../libs/passport-line';

const router = new Router();

router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));

router.get('/auth/line',
    passport.authenticate('line'));

router.get('/auth/line/callback',
    passport.authenticate('line', { failureRedirect: '/login', successRedirect: '/' }));

export { router };
