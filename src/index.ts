import * as Koa from 'koa';
import * as serve from 'koa-static';
import * as logger from 'koa-logger';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { passport } from './libs/passport-line';
import router from './routes/';

const app = new Koa();

app.keys = ['secret'];

app
    .use(serve('public'))
    .use(logger())
    .use(bodyParser())
    .use(session({}, app))
    .use(passport.initialize())
    .use(passport.session())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
