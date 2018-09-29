// Node modules.
import * as fs from 'fs';
import * as recursive from 'recursive-readdir';
// TODO: Don't use require.
const Fontmin = require('fontmin');

let staticText = '';
getStaticText();

async function getStaticText() {
    const files = await recursive('./src/views');
    files.forEach((file) => staticText += fs.readFileSync(file, { encoding: 'utf-8' }).replace(/\s/g, ''));
}

export function generateMinimumFont(text: string) {
    new Fontmin()
        .src('./public/assets/fonts/raw/KaiGenGothicTC-Normal.ttf')
        .use(Fontmin.glyph({ text: staticText + text }))
        .dest('./public/assets/fonts/')
        .run();
}
