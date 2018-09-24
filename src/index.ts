import * as Koa from 'koa';
import * as serve from 'koa-static';
import * as logger from 'koa-logger';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { port, webAppURL } from './config';
import { passport } from './libs/passport-line';
import router from './routes/';

const app = new Koa();

app.keys = ['secret'];

app
    .use(serve('public'))
    .use(logger())
    // Body parser.
    .use(bodyParser())
    // Sessions.
    .use(session({}, app))
    // Passport.
    .use(passport.initialize())
    .use(passport.session())
    // Routers.
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port);

console.log(`Web app starting: ${webAppURL}:${port}/.`);
