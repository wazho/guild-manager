import * as Router from 'koa-router';
import { getUsers } from '../libs/google-apis';
import { renderHtml } from '../libs/render-html';

const router = new Router();

router.get('/users', async (ctx, next) => {
    const users = await getUsers();

    const html = renderHtml('./src/views/users.pug', { users });
    ctx.body = html;
});

export { router };
