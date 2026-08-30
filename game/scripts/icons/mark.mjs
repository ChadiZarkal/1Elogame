/**
 * La marque Red or Green, en un seul endroit.
 *
 * L'ancien jeu d'icônes était un fanion noir posé sur un fond `#0D0D0D` : à
 * l'écran d'accueil d'un téléphone, une vignette entièrement noire. Il venait
 * d'un `<text>🚩</text>` rastérisé sur une machine sans police emoji couleur,
 * qui a rendu le glyphe en noir uni.
 *
 * Le fanion est donc redessiné en courbes, et le fond reprend les deux couleurs
 * du logo — `#FF2D2D` et `#22C55E` — séparées en diagonale : à 48 px l'œil lit
 * « rouge ou vert » avant même de reconnaître le fanion.
 */

export const BRAND = {
  red: '#FF2D2D',
  redDeep: '#D31414',
  green: '#22C55E',
  greenDeep: '#0F9E45',
  ink: '#0D0D0D',
  paper: '#FFFFFF',
};

/**
 * Fanion tracé dans une boîte 0..100 × 0..100, hampe comprise.
 * Le drapeau retombe vers la hampe au retour : une pointe droite seule se
 * confond avec une flèche aux petites tailles.
 */
const PENNANT = {
  pole: 'M0 3.5A3.5 3.5 0 0 1 7 3.5V96.5A3.5 3.5 0 0 1 0 96.5Z',
  finial: 'M3.5 0A5.5 5.5 0 1 1 3.5 11A5.5 5.5 0 0 1 3.5 0Z',
  flag: 'M7 8C34 12 68 20 99 33.5C99 33.5 68 43 7 61Z',
};

/**
 * @param {object} o
 * @param {number} o.size        côté de l'icône, en pixels du viewBox
 * @param {number} o.markWidth   largeur allouée au fanion, en pixels du viewBox
 * @param {number} o.radius      rayon des coins ; 0 = carré à fond perdu
 * @param {boolean} [o.split]    fond bicolore en diagonale plutôt qu'uni
 */
export function markSvg({ size, markWidth, radius, split = true }) {
  // Le fanion est plus large que haut : on le centre sur sa boîte réelle.
  const scale = markWidth / 100;
  const markHeight = 100 * scale;
  const dx = (size - markWidth) / 2;
  const dy = (size - markHeight) / 2;

  const background = split
    ? `<path d="M0 0H${size}V0L0 ${size}Z" fill="url(#r)"/>
       <path d="M${size} 0V${size}H0Z" fill="url(#g)"/>`
    : `<rect width="${size}" height="${size}" fill="url(#r)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="r" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.red}"/>
      <stop offset="1" stop-color="${BRAND.redDeep}"/>
    </linearGradient>
    <linearGradient id="g" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${BRAND.green}"/>
      <stop offset="1" stop-color="${BRAND.greenDeep}"/>
    </linearGradient>
    <clipPath id="c"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="${size}" height="${size}" fill="${BRAND.red}"/>
    ${background}
  </g>
  <g transform="translate(${dx} ${dy}) scale(${scale})" fill="${BRAND.paper}">
    <path d="${PENNANT.pole}"/>
    <path d="${PENNANT.finial}"/>
    <path d="${PENNANT.flag}"/>
  </g>
</svg>`;
}
