/**
 * @module dixmais/scale
 * Échelle de notation 0-10 : couleur, libellé, teinte d'ambiance.
 *
 * Source unique de la note. La pastille du profil, la jauge, le fond réactif
 * et le verdict lisent tous d'ici : ils ne peuvent pas diverger.
 */

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;
/** Tout profil démarre à 10. C'est la prémisse du jeu. */
export const START_SCORE = 10;

/** Rouge sang (0) → vert (10). Un cran par point. */
const RAMP = [
  '#8E1B1B', // 0  éliminé
  '#DC2626', // 1
  '#EF4444', // 2
  '#F4703A', // 3
  '#FB923C', // 4
  '#EAB308', // 5
  '#FACC15', // 6
  '#BEF264', // 7
  '#8FD14F', // 8
  '#4ADE80', // 9
  '#22C55E', // 10
];

const LABELS = [
  'ÉLIMINÉ',
  'CAUCHEMAR',
  'RED FLAG AMBULANT',
  'TRÈS CHAUD',
  'BOF',
  'MOYEN',
  'PASSABLE',
  'PAS MAL',
  'SOLIDE',
  'PRESQUE PARFAIT',
  'INTOUCHABLE',
];

export function clampScore(n: number): number {
  // `Number.isNaN` laisse passer `undefined` : la rampe renverrait alors
  // `undefined` et toutes les couleurs dérivées seraient silencieusement
  // invalides. `isFinite` couvre NaN, l'infini et les non-nombres.
  if (!Number.isFinite(n)) return START_SCORE;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(n)));
}

export function scoreColor(n: number): string {
  return RAMP[clampScore(n)];
}

export function scoreLabel(n: number): string {
  return LABELS[clampScore(n)];
}

/**
 * Variante alpha d'une couleur de la rampe.
 * Les couleurs sont toutes en `#RRGGBB`, on suffixe simplement l'octet alpha.
 */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/** `-3`, `+1`, `0` — signe explicite, c'est le cœur du feedback cumulatif. */
export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}
