import * as nsg from 'node-sprite-generator';

nsg({
    src: [
        './public/assets/class_bg/default.png',
        './public/assets/class_bg/explorer_warrior.png',
        './public/assets/class_bg/explorer_magician.png',
        './public/assets/class_bg/explorer_bowman.png',
        './public/assets/class_bg/explorer_thief.png',
        './public/assets/class_bg/explorer_pirate.png',
        './public/assets/class_bg/cygnus.png',
        './public/assets/class_bg/resistance.png',
        './public/assets/class_bg/sengoku.png',
        './public/assets/class_bg/hero_aran.png',
        './public/assets/class_bg/hero_evan.png',
        './public/assets/class_bg/hero_luminous.png',
        './public/assets/class_bg/hero_mercedes.png',
        './public/assets/class_bg/hero_phantom.png',
        './public/assets/class_bg/hero_eunwol.png',
        './public/assets/class_bg/nova.png',
        './public/assets/class_bg/nova_cadena.png',
        './public/assets/class_bg/pirate_ark.png',
        './public/assets/class_bg/pirate_illium.png',
        './public/assets/class_bg/zero.png',
        './public/assets/class_bg/kinesis.png',
        './public/assets/class_bg/beasttamer.png',
    ],
    spritePath: './public/assets/class_bg/_all.png',
}, (err) => console.log(err));

console.log(`Please do tinyify on TinyPNG. (https://tinypng.com/)`);
