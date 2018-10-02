// Node modules.
import { renderFile } from 'pug';
import { minify } from 'html-minifier';
// Local modules.
import * as configs from '../config';

const renderHtml = (path: string, options?: any) => {
    const env = { ...configs };
    const rawHtml = renderFile(path, { options, env });
    const html = minify(rawHtml, {
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
    });

    return html;
};

export {
    renderHtml,
}
