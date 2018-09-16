import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { passport } from './libs/passport-line';
import { indexRouter, lineLoginRouter } from './routes/';

const app = new Koa();

app.keys = ['secret'];

app
    .use(bodyParser())
    .use(session({}, app))
    .use(passport.initialize())
    .use(passport.session())
    .use(indexRouter.routes())
    .use(indexRouter.allowedMethods())
    .use(lineLoginRouter.routes())
    .use(lineLoginRouter.allowedMethods())
    .listen(3000);
