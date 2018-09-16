import * as passport from 'koa-passport';
import { Strategy as LineStrategy } from 'passport-line';

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new LineStrategy({
    channelID: '1608000703',
    channelSecret: '2eaa8b15b3a76849bbe01aaab34528fc',
    callbackURL: 'http://127.0.0.1:3000/auth/line/callback'
}, (accessToken: any, refreshToken: any, profile: any, done: any) => {
    const { id, displayName, pictureUrl } = profile;
    console.log(id, displayName, pictureUrl);
    process.nextTick(() => done(null, profile));
}));

export {
    passport,
};
