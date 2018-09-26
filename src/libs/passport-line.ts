// Node modules.
import * as passport from 'koa-passport';
import { Strategy as LineStrategy } from 'passport-line';
// Local modules.
import { findUser } from './google-apis';
import { lineChannel } from '../config';

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    const user = await findUser(id) || {};
    done(null, user);
});

passport.use(new LineStrategy(lineChannel, (accessToken: any, refreshToken: any, profile: any, done: any) => {
    const token = { accessToken, refreshToken };
    process.nextTick(() => done(null, profile, token));
}));

export {
    passport,
};
