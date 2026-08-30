/**
 * La marque Red or Green, en un seul endroit.
 *
 * L'icône reprend le lettrage du logo — le vrai, celui de
 * `public/logo-rog-new.svg` — et non un symbole inventé à côté. Le logo est
 * horizontal en diagonale (« RED » en haut à gauche, « GREEN » en bas à
 * droite) : dans un carré de 48 px il ne resterait qu'une bouillie. Ses trois
 * groupes sont donc réempilés en verticale, « RED » au-dessus de « or »
 * au-dessus de « GREEN », ce qui remplit le carré et garde les lettres
 * lisibles jusqu'aux plus petites tailles.
 *
 * L'icône précédente était un fanion noir sur fond `#0D0D0D` — invisible.
 * Elle venait d'un `<text>🚩</text>` rastérisé sur une machine sans police
 * emoji couleur, qui a rendu le glyphe en noir uni.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = join(HERE, '..', '..', 'public', 'logo-rog-new.svg');

export const BRAND = {
  red: '#FF2D2D',
  green: '#22C55E',
  paper: '#FFFFFF',
  ink: '#0D0D0D',
};

/**
 * Cadres des trois groupes dans le repère du logo, mesurés sur le fichier via
 * `getBBox()`. Ils sont figés ici parce qu'aucun rastériseur n'est disponible
 * au moment de la génération ; le contrôle ci-dessous échoue bruyamment si le
 * logo change de structure, plutôt que de produire une icône de travers.
 */
const GROUPS = {
  red:   { fill: BRAND.red,   count: 3, box: { x: 0,     y: 0,     w: 87.81, h: 65.88 } },
  or:    { fill: 'white',     count: 2, box: { x: 29.44, y: 39.68, w: 33.44, h: 25.17 } },
  green: { fill: BRAND.green, count: 5, box: { x: 63,    y: 27,    w: 129,   h: 58.12 } },
};

/** Extrait les `d` du logo, groupés par couleur de remplissage. */
function readLogoPaths() {
  const svg = readFileSync(LOGO_PATH, 'utf8');
  const byFill = { [BRAND.red]: [], [BRAND.green]: [], white: [] };

  for (const tag of svg.match(/<path\b[^>]*>/g) ?? []) {
    const d = tag.match(/\bd="([^"]+)"/)?.[1];
    const fill = tag.match(/\bfill="([^"]+)"/)?.[1];
    if (!d || !fill || !(fill in byFill)) continue;
    byFill[fill].push(d);
  }

  for (const [name, group] of Object.entries(GROUPS)) {
    const found = byFill[group.fill].length;
    if (found !== group.count) {
      throw new Error(
        `logo-rog-new.svg a change : le groupe « ${name} » compte ${found} tracés au lieu de ${group.count}. ` +
        'Remesure les cadres de GROUPS avec getBBox() avant de régénérer.',
      );
    }
  }
  return byFill;
}

/**
 * Place un groupe dans le repère de l'icône : mise à l'échelle sur `width`,
 * coin haut-gauche en (`x`, `y`).
 */
function place(paths, box, fill, x, y, width) {
  const k = width / box.w;
  const tx = x - box.x * k;
  const ty = y - box.y * k;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(5)})" fill="${fill}">${
    paths.map((d) => `<path d="${d}"/>`).join('')
  }</g>`;
}

/**
 * @param {object} o
 * @param {number} o.size          côté de l'icône, en unités du viewBox
 * @param {number} o.contentRatio  part du côté occupée par le lettrage
 * @param {number} o.radius        rayon des coins ; 0 = carré à fond perdu
 */
export function markSvg({ size, contentRatio, radius }) {
  const logo = readLogoPaths();

  /* « RED » et « GREEN » sont amenés à la même largeur : c'est ce qui fait
     tenir un empilement, les deux mots pesant alors le même poids visuel.
     Le chevauchement de 8 % reprend celui du logo d'origine, où « or »
     mord sur les deux. */
  const OVERLAP = 0.92;
  const W = size * contentRatio;
  const hRed = W * (GROUPS.red.box.h / GROUPS.red.box.w);
  const hGreen = W * (GROUPS.green.box.h / GROUPS.green.box.w);
  const wOr = W * 0.3;
  const hOr = wOr * (GROUPS.or.box.h / GROUPS.or.box.w);

  const stackH = hRed * OVERLAP + hGreen;
  const x0 = (size - W) / 2;
  const y0 = (size - stackH) / 2;
  const yGreen = y0 + hRed * OVERLAP;

  /* Léger décalage latéral : il rappelle la diagonale du logo sans la
     reproduire, qui serait illisible une fois réduite. */
  const skew = W * 0.035;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="30%" cy="22%" r="88%">
      <stop offset="0" stop-color="#20141A"/>
      <stop offset="0.55" stop-color="#111013"/>
      <stop offset="1" stop-color="#08080A"/>
    </radialGradient>
    <clipPath id="c"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
  </g>
  ${place(logo[BRAND.red], GROUPS.red.box, BRAND.red, x0 - skew, y0, W)}
  ${place(logo[BRAND.green], GROUPS.green.box, BRAND.green, x0 + skew, yGreen, W)}
  ${place(logo.white, GROUPS.or.box, BRAND.paper, (size - wOr) / 2, yGreen - hOr * 0.62, wOr)}
</svg>`;
}
