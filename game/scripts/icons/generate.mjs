/**
 * Régénère tout le jeu d'icônes depuis `mark.mjs`.
 *
 *   node scripts/icons/generate.mjs
 *
 * À relancer après toute retouche du logo ou de la marque : les fichiers
 * produits sont versionnés, ils ne sont pas régénérés au build.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { markSvg } from './mark.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pub = (f) => join(ROOT, 'public', f);
const app = (f) => join(ROOT, 'src', 'app', f);

/** Coins de l'icône « any » : 22,3 % du côté, la squircle des plateformes. */
const RADIUS_RATIO = 114 / 512;

/** Icône `any` : coins arrondis, lettrage au plus large. */
const svgAny = (size) =>
  markSvg({ size, contentRatio: 0.78, radius: size * RADIUS_RATIO });

/**
 * Icône `maskable` : fond perdu, lettrage contenu dans le cercle de sûreté.
 *
 * Android rogne l'icône selon la forme du lanceur — jusqu'à un cercle de 80 %
 * du côté. Le lettrage empilé est plus haut que large : à 0,52 du côté, sa
 * demi-diagonale reste sous le rayon de sûreté de 204,8 px (sur 512), et
 * aucune lettre n'est coupée quelle que soit la découpe.
 */
const svgMaskable = (size) => markSvg({ size, contentRatio: 0.52, radius: 0 });

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Conteneur ICO minimal enveloppant des trames PNG (accepté depuis Vista).
 * `sharp` n'écrit pas ce format, et la dizaine d'octets d'en-tête ne justifie
 * pas une dépendance de plus.
 */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : icône
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + frames.length * 16;
  const entries = frames.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 vaut 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

/**
 * Silhouette pleine, sans fond : Android la teinte lui-même (thémé Material
 * You). Le fond et les couleurs de marque tombent, seules les formes restent.
 */
function monochromeSvg() {
  return svgMaskable(512)
    .replace(/<g clip-path="url\(#c\)">[\s\S]*?<\/g>/, '')
    .replace(/fill="(#FF2D2D|#22C55E|#FFFFFF)"/g, 'fill="black"');
}

const written = [];
const write = (path, data) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  written.push(`${path.slice(ROOT.length + 1)}  ${(data.length / 1024).toFixed(1)} ko`);
};

// Vecteur : c'est lui que servent les navigateurs modernes pour l'onglet.
write(app('icon.svg'), svgAny(512));
write(pub('icon-monochrome.svg'), monochromeSvg());

// Rasters du manifeste.
write(pub('icon-192.png'), await png(svgAny(512), 192));
write(pub('icon-512.png'), await png(svgAny(512), 512));
write(pub('icon-maskable-192.png'), await png(svgMaskable(512), 192));
write(pub('icon-maskable-512.png'), await png(svgMaskable(512), 512));

// iOS applique son propre masque : on lui donne un carré à fond perdu, avec
// un peu plus de marge que l'icône `any` puisque la squircle rogne les coins.
write(app('apple-icon.png'), await png(markSvg({ size: 512, contentRatio: 0.7, radius: 0 }), 180));

// Repli pour les agents qui ignorent le SVG.
write(
  app('favicon.ico'),
  ico(
    await Promise.all(
      [16, 32, 48].map(async (size) => ({ size, data: await png(svgAny(512), size) })),
    ),
  ),
);

console.log(written.join('\n'));
