"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("koa-passport");
exports.passport = passport;
const passport_line_1 = require("passport-line");
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});
passport.use(new passport_line_1.Strategy({
    channelID: '1608000703',
    channelSecret: '2eaa8b15b3a76849bbe01aaab34528fc',
    callbackURL: 'http://127.0.0.1:3000/auth/line/callback'
}, (accessToken, refreshToken, profile, done) => {
    const { id, displayName, pictureUrl } = profile;
    console.log(id, displayName, pictureUrl);
    process.nextTick(() => done(null, profile));
}));
//# sourceMappingURL=passport-line.js.map