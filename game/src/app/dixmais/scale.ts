/**
 * @module dixmais/scale
 * Échelle de notation 0-15 : couleur, libellé, teinte d'ambiance.
 *
 * Tout profil part de 10. Un red flag le fait descendre ; un green flag peut
 * le faire **dépasser** 10, jusqu'à 15 — sans quoi une qualité, notée seule,
 * ne pourrait jamais rien rapporter et n'aurait pas sa place dans le jeu.
 * « 15/10 » est voulu : c'est la blague, et c'est la promesse du titre.
 *
 * Source unique de la note. La pastille du profil, la jauge, le fond réactif
 * et le verdict lisent tous d'ici : ils ne peuvent pas diverger.
 */

export const MIN_SCORE = 0;
export const MAX_SCORE = 15;
/** Tout profil démarre à 10. C'est la prémisse du jeu. */
export const START_SCORE = 10;
/** Le dénominateur affiché : on note toujours « sur 10 », même au-delà. */
export const SCALE_BASE = 10;

/** Rouge sang (0) → vert (10), puis au-delà du 10 : turquoise, bleu, or. */
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
  '#2DD4BF', // 11 — au-delà du 10
  '#38BDF8', // 12
  '#818CF8', // 13
  '#C084FC', // 14
  '#FFD700', // 15
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
  "MIEUX QU'UN 10",
  'PÉPITE',
  'PERLE RARE',
  'LICORNE',
  'HORS BARÈME',
];

/** La note dépasse le 10 de départ : zone des green flags. */
export function isBonus(n: number): boolean {
  return n > START_SCORE;
}

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

/**
 * Couleur d'une note écrite en chiffres. Le rouge sang du 0 est fait pour un
 * aplat ; en texte sur fond noir, il disparaît. On l'éclaircit.
 */
export function scoreInk(n: number): string {
  return clampScore(n) === 0 ? '#F87171' : scoreColor(n);
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

/** `-3`, `+1`, `0` — signe explicite : ce que l'info retire ou ajoute au 10. */
export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}
