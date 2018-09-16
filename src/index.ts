import * as Koa from 'koa';
import * as Router from 'koa-router';
import { passport } from './libs/passport-line';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';

const app = new Koa();
const router = new Router();

router.get('/', (ctx, next) => {
    ctx.body = '/login to login';
});

router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));

router.get('/auth/line',
    passport.authenticate('line'));

router.get('/auth/line/callback',
    passport.authenticate('line', { failureRedirect: '/login', successRedirect: '/' }));

app.keys = ['secret'];

app
    .use(bodyParser())
    .use(session({}, app))
    .use(passport.initialize())
    .use(passport.session())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
