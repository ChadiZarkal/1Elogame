/**
 * @module dixmais/finsEn
 * Ce que le jeu écrit lui-même, en anglais : les fins d'un profil, les
 * portraits du bilan, les phrases de sévérité et de cohorte, les libellés de
 * la jauge et des catégories.
 *
 * La logique reste en français dans `moyenne`, `cohort` et `scale` : quelle
 * fin, quel portrait, quel palier. Ce fichier ne fait que réécrire le texte de
 * ce qui a été choisi, clé par clé — une fin ajoutée là-bas sans sa version
 * ici garde son texte français (le test anglais le signale).
 *
 * Anglais naturel plutôt que calque : « TU L'AS ACHEVÉ » devient
 * « YOU FINISHED HIM OFF », et le pronom suit la personne notée.
 */

import type { PlayerProfile } from '@/types/game';
import type { CohortComparison } from './cohort';
import { poidsDansLaMoyenne, type Archetype, type ContexteFin, type Fin, type Severite } from './moyenne';
import { MIN_SCORE, clampScore } from './scale';

/** Une décimale, point anglais : « 6.4 ». Un entier reste un entier. */
export function formatNoteEn(n: number): string {
  const arrondi = Math.round(n * 10) / 10;
  return Number.isInteger(arrondi) ? String(arrondi) : arrondi.toFixed(1);
}

/** « 1 point », « 1.4 points », « 2 points » : le pluriel anglais. */
export function pointsEn(n: number): string {
  const texte = formatNoteEn(n);
  return `${texte} ${texte === '1' ? 'point' : 'points'}`;
}

function court(texte: string, max = 40): string {
  const t = texte.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

const cite = (t: string) => `“${t}”`;

function indexMin(notes: number[]): number {
  return notes.reduce((best, n, i) => (n < notes[best] ? i : best), 0);
}
function indexMax(notes: number[]): number {
  return notes.reduce((best, n, i) => (n > notes[best] ? i : best), 0);
}

const he = (c: ContexteFin) => (c.pronom === 'elle' ? 'she' : 'he');
const He = (c: ContexteFin) => (c.pronom === 'elle' ? 'She' : 'He');
const him = (c: ContexteFin) => (c.pronom === 'elle' ? 'her' : 'him');
const his = (c: ContexteFin) => (c.pronom === 'elle' ? 'her' : 'his');
const His = (c: ContexteFin) => (c.pronom === 'elle' ? 'Her' : 'His');

type TexteFin = Pick<Fin, 'title' | 'subtitle'>;

/** Les fins de `moyenne.CANDIDATES`, par clé. */
const FINS_EN: Record<string, (c: ContexteFin) => TexteFin> = {
  'hors-bareme': (c) => ({
    title: 'OFF THE CHARTS',
    subtitle: `${formatNoteEn(c.moyenne)}/10. That starting 10? ${He(c)} smashed right through it.`,
  }),
  'sans-faute': (c) => ({
    title: 'FLAWLESS',
    subtitle: `Not a single point lost, not even on the red flags. Either ${he(c)}’s perfect, or you’re already in love.`,
  }),
  'sauve-par-ses-qualites': (c) => {
    const i = indexMax(c.notes);
    return {
      title: 'SAVED BY THE GREEN FLAGS',
      subtitle: `${His(c)} red flags were sinking ${him(c)}. ${cite(court(c.propositions[i]?.text ?? ''))} pulled ${him(c)} back out.`,
    };
  },
  'qualites-ignorees': (c) => ({
    title: 'GREEN FLAGS? BARE MINIMUM',
    subtitle: `Not one bonus point for ${his(c)} green flags. In your book, being decent earns nothing.`,
  }),
  'tolerance-zero': () => ({
    title: 'ZERO TOLERANCE',
    subtitle: 'Zeros across the board. Not one mitigating circumstance.',
  }),
  'redhibitoire-en-theorie': (c) => {
    const i = c.notes.indexOf(MIN_SCORE);
    return {
      title: 'A DEAL-BREAKER… IN THEORY',
      subtitle: `A zero for ${cite(court(c.propositions[i]?.text ?? ''))}, and ${he(c)} still ends up at ${formatNoteEn(c.moyenne)}.`,
    };
  },
  'coup-fatal': (c) => {
    const i = c.notes.indexOf(MIN_SCORE);
    return {
      title: 'THE KILLING BLOW',
      subtitle: `${cite(court(c.propositions[i]?.text ?? ''))}: zero. That one alone knocks ${pointsEn(poidsDansLaMoyenne(c.notes, i))} off the average.`,
    };
  },
  'un-seul-defaut': (c) => {
    const i = indexMin(c.notes);
    return {
      title: 'ONE REAL FLAW',
      subtitle: `Everything else, you’d forgive. ${cite(court(c.propositions[i]?.text ?? ''))}? No way.`,
    };
  },
  'tu-l-as-acheve': (c) => ({
    title: `YOU FINISHED ${him(c).toUpperCase()} OFF`,
    subtitle: `Everyone else gives ${him(c)} ${formatNoteEn(c.moyenneCommunaute ?? 0)}. You: ${formatNoteEn(c.moyenne)}. ${He(c)} never stood a chance with you.`,
  }),
  'tu-l-as-sauve': (c) => ({
    title: `YOU SAVED ${him(c).toUpperCase()}`,
    subtitle: `Everyone else gives ${him(c)} ${formatNoteEn(c.moyenneCommunaute ?? 0)}. You: ${formatNoteEn(c.moyenne)}. You see something they don’t.`,
  }),
  'grand-ecart': (c) => {
    const haut = indexMax(c.notes);
    const bas = indexMin(c.notes);
    return {
      title: 'NIGHT AND DAY',
      subtitle: `${c.notes[haut]} for ${cite(court(c.propositions[haut]?.text ?? '', 30))}, ${c.notes[bas]} for ${cite(court(c.propositions[bas]?.text ?? '', 30))}. Not all flags are equal.`,
    };
  },
  bareme: () => ({
    title: 'BY THE BOOK',
    subtitle: 'Seven reveals, seven scores within a point of each other. You have a rule, and you stick to it.',
  }),
  'mieux-qu-un-10': (c) => ({
    title: 'BETTER THAN A 10',
    subtitle: `The green flags more than made up for it. ${He(c)} walks away with ${formatNoteEn(c.moyenne)}/10.`,
  }),
  'un-vrai-10': (c) => ({
    title: 'A TRUE 10',
    subtitle: `Red flags, sure. But ${he(c)}’s still a 10, and you know it.`,
  }),
  'bon-parti': () => ({
    title: 'A GOOD CATCH',
    subtitle: 'Nothing here stops you from saying yes. You’re in.',
  }),
  'ca-se-tente': () => ({
    title: 'WORTH A SHOT',
    subtitle: 'One drink, no more. We’ll see how it goes.',
  }),
  'a-tes-risques': () => ({
    title: 'AT YOUR OWN RISK',
    subtitle: 'Dead average. Not a yes, not a no: a “we’ll see” that never goes anywhere.',
  }),
  'plan-galere': () => ({
    title: 'FIXER-UPPER',
    subtitle: 'There’s work to do. A lot of work.',
  }),
  fuis: () => ({
    title: 'RUN',
    subtitle: 'You don’t need another red flag to get the message.',
  }),
  'ni-de-pres': () => ({
    title: 'NOT IN A MILLION YEARS',
    subtitle: 'That starting 10 is a distant memory.',
  }),
};

/** La fin retenue, réécrite en anglais. Le ton et la clé ne changent pas. */
export function finEn(fin: Fin, c: ContexteFin): Fin {
  const texte = FINS_EN[fin.key];
  return texte ? { ...fin, ...texte(c) } : fin;
}

export const CLES_FINS_EN = Object.keys(FINS_EN);

/** Les portraits de `moyenne.ARCHETYPES`, par clé. L'émoji ne change pas. */
const ARCHETYPES_EN: Record<string, Pick<Archetype, 'title' | 'tagline'>> = {
  bourreau: {
    title: 'THE EXECUTIONER',
    tagline: 'To you, a red flag is basically already a zero. Nobody gets a passing grade.',
  },
  binaire: {
    title: 'ALL OR NOTHING',
    tagline: 'Zero or fifteen, never six. To you, a detail either matters hugely or not at all.',
  },
  'coeur-d-artichaut': {
    title: 'THE EASY CRUSH',
    tagline: 'One good quality and you’re gone. A guy who cooks well? 14/10.',
  },
  'insensible-au-vert': {
    title: 'IMMUNE TO GREEN',
    tagline: 'Green flags slide right off you. To you, being decent is the bare minimum.',
  },
  procureur: {
    title: 'THE PROSECUTOR',
    tagline: 'You rate every reveal way lower than everyone else. Nothing gets past you.',
  },
  avocat: {
    title: 'THE PUBLIC DEFENDER',
    tagline: 'Everyone else convicts, you plead the case. You always find a mitigating circumstance.',
  },
  tiede: {
    title: 'THE FENCE-SITTER',
    tagline: 'Never a zero, never a ten. You don’t commit to anything.',
  },
  romantique: {
    title: 'THE HOPELESS ROMANTIC',
    tagline: 'You see the best in everyone. It’s beautiful. It’s also how people get played.',
  },
  comptable: {
    title: 'THE ACCOUNTANT',
    tagline: 'You rate exactly like everyone else. Statistically, you are the average.',
  },
  exigeant: {
    title: 'THE PICKY ONE',
    tagline: 'You have standards. Lots of standards. Too many, some would say.',
  },
  jure: {
    title: 'THE JUROR',
    tagline: 'You weigh each reveal, one by one, and you rule. Without a flicker of emotion.',
  },
};

export function archetypeEn(a: Archetype): Archetype {
  const texte = ARCHETYPES_EN[a.key];
  return texte ? { ...a, ...texte } : a;
}

export const CLES_ARCHETYPES_EN = Object.keys(ARCHETYPES_EN);

/** La phrase de sévérité, mêmes paliers que `moyenne.phraseSeverite`. */
export function phraseSeveriteEn(s: Severite | null): string | null {
  if (!s) return null;
  const e = Math.abs(s.ecart).toFixed(1);
  const pts = e === '1.0' ? 'point' : 'points';
  if (s.ecart <= -2) return `You give ${e} ${pts} less than everyone else on every reveal. You’re extremely harsh.`;
  if (s.ecart <= -0.8) return `You’re harsher than average: ${e} ${pts} less on every reveal.`;
  if (s.ecart < -0.3) return 'You’re a little harsher than average, nothing extreme.';
  if (s.ecart <= 0.3) return 'You rate just like the average player, give or take a hair.';
  if (s.ecart < 1.5) return `You’re more lenient than average: ${e} ${pts} more on every reveal.`;
  return `You give ${e} points more than everyone else on every reveal. Nobody’s as nice as you.`;
}

const SEX_NOUNS_EN: Record<string, string> = {
  homme: 'men',
  femme: 'women',
  autre: 'players',
};

/** « women aged 19-22 », « men aged 27 and up ». */
export function cohortNounEn(profile: PlayerProfile): string {
  const sexe = SEX_NOUNS_EN[profile.sex] ?? 'players';
  return profile.age === '27+' ? `${sexe} aged 27 and up` : `${sexe} aged ${profile.age}`;
}

/** La phrase de cohorte, mêmes paliers que `cohort.cohortSentence`. */
export function cohortSentenceEn(comparison: CohortComparison, profile: PlayerProfile): string {
  const groupe = cohortNounEn(profile);
  const { gap } = comparison;
  const e = Math.abs(gap).toFixed(1);
  const pts = e === '1.0' ? 'point' : 'points';

  if (gap <= -2) return `You’re extremely harsh compared to ${groupe}: ${e} ${pts} less on every reveal.`;
  if (gap <= -0.8) return `You’re harsher than ${groupe}: ${e} ${pts} less on every reveal.`;
  if (gap < -0.3) return `You’re a little harsher than ${groupe}.`;
  if (gap <= 0.3) return `You rate exactly like ${groupe}. Nothing sets you apart.`;
  if (gap < 1.5) return `You’re more lenient than ${groupe}: ${e} ${pts} more on every reveal.`;
  return `You’re way softer than ${groupe}: ${e} ${pts} more on every reveal.`;
}

/** Les libellés de la jauge, de 0 à 15 (`scale.LABELS`). */
const LABELS_EN = [
  'ELIMINATED',
  'NIGHTMARE',
  'WALKING RED FLAG',
  'RISKY BUSINESS',
  'MEH',
  'SO-SO',
  'PASSABLE',
  'NOT BAD',
  'SOLID',
  'ALMOST PERFECT',
  'UNTOUCHABLE',
  'BETTER THAN A 10',
  'A REAL GEM',
  'ONE IN A MILLION',
  'UNICORN',
  'OFF THE CHARTS',
];

export function scoreLabelEn(n: number): string {
  return LABELS_EN[clampScore(n)];
}

/** Les catégories du catalogue (`moyenne.CATEGORIES`). */
const CATEGORIES_EN: Record<string, string> = {
  general: 'General',
  politique: 'Politics',
  caractere: 'Personality',
  dating: 'Relationships',
  lifestyle: 'Lifestyle',
  social: 'With others',
  argent: 'Money',
  travail: 'Work',
  sante: 'Health',
  famille: 'Family',
};

export function libelleCategorieEn(category: string): string {
  return CATEGORIES_EN[category] ?? category;
}
