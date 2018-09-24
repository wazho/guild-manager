// Node modules.
import { renderFile } from 'pug';
import { minify } from 'html-minifier';

const renderHtml = (path: string, options?: any) => {
    const rawHtml = renderFile(path, options);
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
