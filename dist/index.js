"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const passport_line_1 = require("./libs/passport-line");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session");
const app = new Koa();
const router = new Router();
router.get('/', (ctx, next) => {
    ctx.body = '!!';
});
router.get('/login', (ctx, next) => ctx.redirect('/auth/line'));
router.get('/auth/line', passport_line_1.passport.authenticate('line'));
router.get('/auth/line/callback', passport_line_1.passport.authenticate('line', { failureRedirect: '/login', successRedirect: '/' }));
app.keys = ['secret'];
app
    .use(bodyParser())
    .use(session({}, app))
    .use(passport_line_1.passport.initialize())
    .use(passport_line_1.passport.session())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
//# sourceMappingURL=index.js.map