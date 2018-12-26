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

nsg({
    src: [
        './public/assets/union_badges/novice-union-1.png',
        './public/assets/union_badges/novice-union-2.png',
        './public/assets/union_badges/novice-union-3.png',
        './public/assets/union_badges/novice-union-4.png',
        './public/assets/union_badges/novice-union-5.png',
        './public/assets/union_badges/veteran-union-1.png',
        './public/assets/union_badges/veteran-union-2.png',
        './public/assets/union_badges/veteran-union-3.png',
        './public/assets/union_badges/veteran-union-4.png',
        './public/assets/union_badges/veteran-union-5.png',
        './public/assets/union_badges/master-union-1.png',
        './public/assets/union_badges/master-union-2.png',
        './public/assets/union_badges/master-union-3.png',
        './public/assets/union_badges/master-union-4.png',
        './public/assets/union_badges/master-union-5.png',
        './public/assets/union_badges/grand-master-union-1.png',
        './public/assets/union_badges/grand-master-union-2.png',
        './public/assets/union_badges/grand-master-union-3.png',
        './public/assets/union_badges/grand-master-union-4.png',
        './public/assets/union_badges/grand-master-union-5.png',
    ],
    spritePath: './public/assets/union_badges/_all.png',
}, (err) => console.log(err));

console.log(`Please do tinyify on TinyPNG. (https://tinypng.com/)`);
