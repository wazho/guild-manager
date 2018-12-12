// Node modules.
import Router from 'koa-router';
// Local modules.
import { findMember, MemberStatus } from '../libs/google-apis';

export async function statusAuth(ctx: Router.IRouterContext, next: () => Promise<any>) {
    // Can pass all pages if not production mode.
    if (process.env.NODE_ENV !== 'production') {
        await next();
        return;
    }

    const { user } = ctx.state;
    const remoteUser = await findMember(user && user.lineID);

    if (remoteUser) {
        const legalLevels = [MemberStatus.公會長, MemberStatus.副會長, MemberStatus.會員];
        if (legalLevels.includes(remoteUser.status)) {
            await next();
        } else {
            ctx.redirect('/');
        }
    } else {
        ctx.redirect('/login');
    }
}
