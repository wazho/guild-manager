import * as passport from 'koa-passport';
import { Strategy as LineStrategy } from 'passport-line';
import { lineChannel } from '../config';

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new LineStrategy(lineChannel, (accessToken: any, refreshToken: any, profile: any, done: any) => {
    process.nextTick(() => done(null, profile));
}));

export {
    passport,
};
