/**
 * @module dixmais/moyenne
 * La règle du jeu : chaque révélation se note seule, et la note du profil est
 * la moyenne des cinq.
 *
 * Un red flag fait descendre sous 10 ; un green flag peut faire monter
 * au-dessus, jusqu'à 15. Une moyenne peut donc dépasser 10 : c'est le
 * « 12/10 » d'un profil dont les qualités ont racheté les défauts.
 *
 * L'ancienne version empilait les révélations et faisait réajuster une note
 * unique, qui ne remontait presque jamais. Ici, chaque phrase est jugée pour
 * elle-même — « c'est un 10, mais il est jaloux maladif : combien ? » — et ce
 * n'est qu'une fois les cinq jugées que la personne reçoit sa note : la
 * moyenne. Un zéro pèse lourd, mais il n'efface plus le reste.
 *
 * Tout est pur et sans réseau : l'écran de fin, la fin retenue et le bilan de
 * session se calculent d'ici.
 */

import type { DixMaisStatement } from '@/types/database';
import { MAX_SCORE, MIN_SCORE, START_SCORE } from './scale';

/** Cinq révélations par profil : assez pour qu'une moyenne veuille dire
 * quelque chose, assez peu pour qu'on enchaîne les profils. */
export const PROPOSITIONS_PAR_PROFIL = 5;

/** Dont deux green flags : de quoi faire remonter un profil, sans que les
 * qualités l'emportent sur les défauts, qui restent le cœur du jeu. */
export const GREEN_FLAGS_PAR_PROFIL = 2;

/** Sous ce nombre de votes, la note des autres sur une phrase est trop
 * bruitée pour être opposée au joueur. */
export const VOTES_MIN_COMPARAISON = 5;

/** Une moyenne des autres n'est citée que si au moins trois des cinq phrases
 * sont mesurables : sinon elle ne parle plus du même profil. */
const MESURABLES_MIN_PROFIL = 3;

/** Sous quatre phrases comparables sur la session, on ne conclut pas sur la
 * sévérité du joueur. */
export const MESURABLES_MIN_SESSION = 4;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Proposition {
  id: string;
  text: string;
  type: 'positive' | 'negative';
  category: string;
}

export interface Fin {
  key: string;
  title: string;
  subtitle: string;
  /** Déclenche les confettis ou la secousse du verdict. */
  tone: 'brutal' | 'triumphant' | 'neutral';
}

/** Un profil jugé de bout en bout, figé au moment du verdict. */
export interface ProfilJuge {
  numero: number;
  nom: string;
  age: number;
  initiale: string;
  teinte: number;
  propositions: Proposition[];
  /** La note donnée à chaque révélation, seule (0 à 15). */
  notes: number[];
  /** La note que les autres donnent à cette révélation, `null` si trop peu votée. */
  communaute: (number | null)[];
  /** La note de la personne : la moyenne exacte des cinq. */
  moyenne: number;
  /** Ce que les autres lui auraient mis, `null` si trop peu mesurable. */
  moyenneCommunaute: number | null;
  fin: Fin;
}

// ---------------------------------------------------------------------------
// Calculs de base
// ---------------------------------------------------------------------------

export function moyenneDe(valeurs: number[]): number {
  if (valeurs.length === 0) return START_SCORE;
  return valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
}

function ecartType(valeurs: number[]): number {
  if (valeurs.length < 2) return 0;
  const m = moyenneDe(valeurs);
  return Math.sqrt(moyenneDe(valeurs.map((v) => (v - m) ** 2)));
}

/** Une décimale, virgule française : « 6,4 ». Un entier reste un entier. */
export function formatNote(n: number): string {
  const arrondi = Math.round(n * 10) / 10;
  return Number.isInteger(arrondi) ? String(arrondi) : arrondi.toFixed(1).replace('.', ',');
}

/** Écart signé, une décimale : « +1,2 », « −0,8 ». */
export function formatEcart(n: number): string {
  const v = Math.abs(n).toFixed(1).replace('.', ',');
  if (Math.abs(n) < 0.05) return '0';
  return n > 0 ? `+${v}` : `−${v}`;
}

/**
 * La note que les autres joueurs donnent à cette phrase, seule.
 *
 * Les votes en base viennent de l'ancienne mécanique : ils mesurent combien
 * chaque révélation retirait (ou rendait) à la note en cours. Ce delta moyen
 * est l'estimation la plus proche d'une note isolée — 10 plus ce que la phrase
 * fait gagner ou perdre — tant que la nouvelle mécanique n'enregistre pas ses
 * propres votes.
 *
 * @remarks Pour un green flag, l'estimation est basse : l'ancienne note était
 * plafonnée à 10, si bien qu'une qualité ne pouvait que rattraper des points
 * perdus, jamais en ajouter.
 */
export function noteDesAutres(stmt: Pick<DixMaisStatement, 'votes_count' | 'total_delta'> & { avg_delta?: number }): number | null {
  const votes = stmt.votes_count ?? 0;
  if (votes < VOTES_MIN_COMPARAISON) return null;
  const cout = stmt.avg_delta ?? (stmt.total_delta ?? 0) / votes;
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, START_SCORE + cout));
}

export function moyenneDesAutres(communaute: (number | null)[]): number | null {
  const mesurables = communaute.filter((n): n is number => n !== null);
  return mesurables.length >= MESURABLES_MIN_PROFIL ? moyenneDe(mesurables) : null;
}

/** Combien une note fait perdre à la moyenne, par rapport à la moyenne des
 * quatre autres. Positif = elle la tire vers le bas. */
export function poidsDansLaMoyenne(notes: number[], index: number): number {
  if (notes.length < 2) return 0;
  const sans = notes.filter((_, i) => i !== index);
  return moyenneDe(sans) - moyenneDe(notes);
}

// ---------------------------------------------------------------------------
// La fin d'un profil
// ---------------------------------------------------------------------------

export interface ContexteFin {
  propositions: Proposition[];
  notes: number[];
  moyenne: number;
  moyenneCommunaute: number | null;
  /** Il, elle : accorde les sous-titres. */
  pronom: 'il' | 'elle';
}

interface Candidate {
  key: string;
  /** 3 = observation précise, 2 = forme des notes, 1 = palier de moyenne. */
  tier: 1 | 2 | 3;
  when: (c: ContexteFin) => boolean;
  build: (c: ContexteFin) => Omit<Fin, 'key'>;
}

function court(texte: string, max = 40): string {
  const t = texte.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

function indexMin(notes: number[]): number {
  return notes.reduce((best, n, i) => (n < notes[best] ? i : best), 0);
}
function indexMax(notes: number[]): number {
  return notes.reduce((best, n, i) => (n > notes[best] ? i : best), 0);
}

const Il = (c: ContexteFin) => (c.pronom === 'elle' ? 'Elle' : 'Il');
const il = (c: ContexteFin) => c.pronom;

const CANDIDATES: Candidate[] = [
  // ── Palier 3 : ce que les cinq notes racontent précisément ───────────────
  {
    key: 'hors-bareme',
    tier: 3,
    when: (c) => c.moyenne >= 12.5,
    build: (c) => ({
      title: 'HORS BARÈME',
      subtitle: `${formatNote(c.moyenne)}/10. Le 10 du départ, ${il(c)} l'a pulvérisé.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'sans-faute',
    tier: 3,
    when: (c) => c.notes.every((n) => n >= START_SCORE) && c.moyenne < 12.5,
    build: (c) => ({
      title: 'SANS FAUTE',
      subtitle: `Pas un point de perdu, même sur les red flags. Soit ${il(c)} est parfait${c.pronom === 'elle' ? 'e' : ''}, soit tu es déjà amoureux.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'sauve-par-ses-qualites',
    tier: 3,
    when: (c) => {
      const reds = c.notes.filter((_, i) => c.propositions[i]?.type === 'negative');
      const greens = c.notes.filter((_, i) => c.propositions[i]?.type === 'positive');
      return reds.length > 0 && greens.length > 0 && moyenneDe(reds) < 5 && c.moyenne >= 6;
    },
    build: (c) => {
      const i = indexMax(c.notes);
      return {
        title: 'SAUVÉ PAR SES QUALITÉS',
        subtitle: `Ses red flags le coulaient. « ${court(c.propositions[i]?.text ?? '')} » l'a repêché.`,
        tone: 'neutral',
      };
    },
  },
  {
    key: 'qualites-ignorees',
    tier: 3,
    when: (c) => {
      const greens = c.notes.filter((_, i) => c.propositions[i]?.type === 'positive');
      return greens.length >= 2 && greens.every((n) => n <= START_SCORE) && c.moyenne < 8;
    },
    build: () => ({
      title: 'SES QUALITÉS ? LE MINIMUM',
      subtitle: 'Pas un point de bonus pour ses green flags. Chez toi, le bien ne se récompense pas.',
      tone: 'neutral',
    }),
  },
  {
    key: 'tolerance-zero',
    tier: 3,
    when: (c) => c.notes.every((n) => n === MIN_SCORE),
    build: () => ({
      title: 'TOLÉRANCE ZÉRO',
      subtitle: 'Cinq zéros. Pas une seule circonstance atténuante.',
      tone: 'brutal',
    }),
  },
  {
    key: 'redhibitoire-en-theorie',
    tier: 3,
    when: (c) => c.notes.includes(MIN_SCORE) && c.moyenne >= 5,
    build: (c) => {
      const i = c.notes.indexOf(MIN_SCORE);
      return {
        title: 'RÉDHIBITOIRE… EN THÉORIE',
        subtitle: `Zéro pour « ${court(c.propositions[i]?.text ?? '')} », et ${il(c)} finit quand même à ${formatNote(c.moyenne)}.`,
        tone: 'neutral',
      };
    },
  },
  {
    key: 'coup-fatal',
    tier: 3,
    when: (c) => c.notes.includes(MIN_SCORE) && c.moyenne < 5 && c.notes.some((n) => n >= 6),
    build: (c) => {
      const i = c.notes.indexOf(MIN_SCORE);
      return {
        title: 'LE COUP FATAL',
        subtitle: `« ${court(c.propositions[i]?.text ?? '')} » : zéro. À lui seul, il coûte ${formatNote(poidsDansLaMoyenne(c.notes, i))} point${poidsDansLaMoyenne(c.notes, i) >= 2 ? 's' : ''} à la moyenne.`,
        tone: 'brutal',
      };
    },
  },
  {
    key: 'un-seul-defaut',
    tier: 3,
    when: (c) => {
      const bas = c.notes.filter((n) => n <= 3).length;
      const hauts = c.notes.filter((n) => n >= 8).length;
      return bas === 1 && hauts === c.notes.length - 1 && c.moyenne < 10;
    },
    build: (c) => {
      const i = indexMin(c.notes);
      return {
        title: 'UN SEUL VRAI DÉFAUT',
        subtitle: `Tout le reste, tu le lui pardonnes. « ${court(c.propositions[i]?.text ?? '')} », non.`,
        tone: 'neutral',
      };
    },
  },
  {
    key: 'tu-l-as-acheve',
    tier: 3,
    when: (c) => c.moyenneCommunaute !== null && c.moyenne - c.moyenneCommunaute <= -2.5,
    build: (c) => ({
      title: "TU L'AS ACHEVÉ",
      subtitle: `Les autres lui donnent ${formatNote(c.moyenneCommunaute ?? 0)}. Toi, ${formatNote(c.moyenne)}. ${Il(c)} n'avait vraiment aucune chance avec toi.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'tu-l-as-sauve',
    tier: 3,
    when: (c) => c.moyenneCommunaute !== null && c.moyenne - c.moyenneCommunaute >= 2.5,
    build: (c) => ({
      title: "TU L'AS SAUVÉ",
      subtitle: `Les autres lui donnent ${formatNote(c.moyenneCommunaute ?? 0)}. Toi, ${formatNote(c.moyenne)}. Tu vois quelque chose qu'ils ne voient pas.`,
      tone: 'triumphant',
    }),
  },

  // ── Palier 2 : la forme des notes ─────────────────────────────────────────
  {
    key: 'grand-ecart',
    tier: 2,
    when: (c) => Math.max(...c.notes) - Math.min(...c.notes) >= 9,
    build: (c) => {
      const haut = indexMax(c.notes);
      const bas = indexMin(c.notes);
      return {
        title: 'LE GRAND ÉCART',
        subtitle: `${c.notes[haut]} pour « ${court(c.propositions[haut]?.text ?? '', 30)} », ${c.notes[bas]} pour « ${court(c.propositions[bas]?.text ?? '', 30)} ». Tout ne se vaut pas.`,
        tone: 'neutral',
      };
    },
  },
  {
    key: 'bareme',
    tier: 2,
    when: (c) => c.notes.length >= 4 && Math.max(...c.notes) - Math.min(...c.notes) <= 1,
    build: () => ({
      title: 'LE BARÈME',
      subtitle: 'Cinq révélations, cinq notes à un point près. Tu as une règle, et tu t’y tiens.',
      tone: 'neutral',
    }),
  },

  // ── Palier 1 : la moyenne seule ───────────────────────────────────────────
  {
    key: 'mieux-qu-un-10',
    tier: 1,
    when: (c) => c.moyenne > 10.25,
    build: (c) => ({
      title: "MIEUX QU'UN 10",
      subtitle: `Les qualités ont plus que compensé. ${Il(c)} repart avec ${formatNote(c.moyenne)}/10.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'un-vrai-10',
    tier: 1,
    when: (c) => c.moyenne >= 9 && c.moyenne <= 10.25,
    build: (c) => ({
      title: 'UN VRAI 10',
      subtitle: `Des red flags, oui. Mais ${il(c)} reste un 10, et tu le sais.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'bon-parti',
    tier: 1,
    when: (c) => c.moyenne >= 7.5 && c.moyenne < 9,
    build: () => ({
      title: 'BON PARTI',
      subtitle: 'Rien qui t’empêche de dire oui. Tu signes.',
      tone: 'triumphant',
    }),
  },
  {
    key: 'ca-se-tente',
    tier: 1,
    when: (c) => c.moyenne >= 6 && c.moyenne < 7.5,
    build: () => ({
      title: 'ÇA SE TENTE',
      subtitle: 'Un premier verre, pas plus. On verra bien.',
      tone: 'neutral',
    }),
  },
  {
    key: 'a-tes-risques',
    tier: 1,
    when: (c) => c.moyenne >= 4.5 && c.moyenne < 6,
    build: () => ({
      title: 'À TES RISQUES ET PÉRILS',
      subtitle: 'La moyenne, pile. Ni oui, ni non : un « on verra » qui ne verra jamais rien.',
      tone: 'neutral',
    }),
  },
  {
    key: 'plan-galere',
    tier: 1,
    when: (c) => c.moyenne >= 3 && c.moyenne < 4.5,
    build: () => ({
      title: 'PLAN GALÈRE',
      subtitle: 'Il y a du travail. Beaucoup de travail.',
      tone: 'neutral',
    }),
  },
  {
    key: 'fuis',
    tier: 1,
    when: (c) => c.moyenne >= 1.5 && c.moyenne < 3,
    build: () => ({
      title: 'FUIS',
      subtitle: 'Pas besoin d’un sixième red flag pour comprendre.',
      tone: 'brutal',
    }),
  },
  {
    key: 'ni-de-pres',
    tier: 1,
    when: (c) => c.moyenne < 1.5,
    build: () => ({
      title: 'NI DE PRÈS NI DE LOIN',
      subtitle: 'Le 10 du départ n’est plus qu’un lointain souvenir.',
      tone: 'brutal',
    }),
  },
];

/** Graine déterministe : deux joueurs qui donnent les mêmes notes aux mêmes
 * phrases voient la même fin. */
function graine(c: ContexteFin): number {
  const cle = c.propositions.map((p) => p.id).join('|') + c.notes.join(',');
  let h = 0;
  for (let i = 0; i < cle.length; i++) h = (h * 31 + cle.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Retient la fin la plus spécifique, en écartant celles qui viennent de
 * sortir tant qu'une autre du même palier est éligible.
 */
export function choisirFin(c: ContexteFin, eviter: string[] = []): Fin {
  const eligibles = CANDIDATES.filter((x) => x.when(c));
  const palier = Math.max(...eligibles.map((x) => x.tier));
  const duPalier = eligibles.filter((x) => x.tier === palier);
  const neuves = duPalier.filter((x) => !eviter.includes(x.key));
  const tirage = neuves.length ? neuves : duPalier;
  const choisie = tirage[graine(c) % tirage.length];
  return { key: choisie.key, ...choisie.build(c) };
}

export const NOMBRE_DE_FINS = CANDIDATES.length;

// ---------------------------------------------------------------------------
// Bilan de session
// ---------------------------------------------------------------------------

export interface Jugement {
  text: string;
  type: 'positive' | 'negative';
  category: string;
  note: number;
  /** Note des autres, `null` si la phrase est trop peu votée. */
  autres: number | null;
  /** note − autres : négatif = le joueur est plus dur que les autres. */
  ecart: number | null;
  profil: string;
}

export interface Categorie {
  category: string;
  nombre: number;
  /** Note moyenne donnée par le joueur aux révélations de cette catégorie. */
  moi: number;
  autres: number | null;
}

export interface Severite {
  moi: number;
  autres: number;
  /** moi − autres. Négatif = plus sévère. */
  ecart: number;
  echantillon: number;
}

export interface Archetype {
  key: string;
  title: string;
  tagline: string;
  emoji: string;
}

export interface Bilan {
  profils: number;
  jugements: number;
  /** Moyenne de toutes les notes données : ce que vaut une révélation pour toi. */
  noteMoyenne: number;
  /** Les profils, du mieux noté au moins bien noté. */
  classement: { numero: number; nom: string; age: number; moyenne: number; fin: string }[];
  severite: Severite | null;
  /** Part des révélations notées 0. */
  zeros: number;
  /** Part des notes aux extrêmes (0-1 ou 13-15). */
  extremes: number;
  /** Note moyenne d'un red flag, et d'un green flag (`null` s'il n'en est
   * sorti aucun). */
  moyenneRouge: number | null;
  moyenneVerte: number | null;
  /** Les phrases que le joueur juge rédhibitoires (0 ou 1). */
  redhibitoires: Jugement[];
  /** Les qualités qui le font fondre (13 et plus). */
  coupsDeCoeur: Jugement[];
  categories: Categorie[];
  /** Là où le joueur est le plus dur par rapport aux autres. */
  intransigeance: Jugement | null;
  /** Là où il pardonne alors que les autres condamnent. */
  angleMort: Jugement | null;
  dispersion: number;
  archetype: Archetype;
}

export function deplier(profils: ProfilJuge[]): Jugement[] {
  return profils.flatMap((p) =>
    p.propositions.map((prop, i) => {
      const autres = p.communaute[i] ?? null;
      const note = p.notes[i];
      return {
        text: prop.text,
        type: prop.type,
        category: prop.category,
        note,
        autres,
        ecart: autres === null ? null : note - autres,
        profil: p.nom,
      };
    }),
  );
}

function categoriesDe(jugements: Jugement[]): Categorie[] {
  const groupes = new Map<string, Jugement[]>();
  for (const j of jugements) groupes.set(j.category, [...(groupes.get(j.category) ?? []), j]);

  return [...groupes.entries()]
    .filter(([, liste]) => liste.length >= 2)
    .map(([category, liste]) => {
      const mesurables = liste.filter((j) => j.autres !== null);
      return {
        category,
        nombre: liste.length,
        moi: moyenneDe(liste.map((j) => j.note)),
        autres: mesurables.length ? moyenneDe(mesurables.map((j) => j.autres as number)) : null,
      };
    })
    .sort((a, b) => a.moi - b.moi);
}

function moyenneOuNull(valeurs: number[]): number | null {
  return valeurs.length ? moyenneDe(valeurs) : null;
}

export function construireBilan(profils: ProfilJuge[]): Bilan {
  const jugements = deplier(profils);
  const notes = jugements.map((j) => j.note);
  const comparables = jugements.filter((j) => j.ecart !== null);

  const severite: Severite | null =
    comparables.length >= MESURABLES_MIN_SESSION
      ? {
          moi: moyenneDe(comparables.map((j) => j.note)),
          autres: moyenneDe(comparables.map((j) => j.autres as number)),
          ecart: moyenneDe(comparables.map((j) => j.ecart as number)),
          echantillon: comparables.length,
        }
      : null;

  const parEcart = comparables.slice().sort((a, b) => (a.ecart as number) - (b.ecart as number));
  const plusDur = parEcart[0];
  const plusDoux = parEcart.at(-1);

  const sansArchetype: Omit<Bilan, 'archetype'> = {
    profils: profils.length,
    jugements: jugements.length,
    noteMoyenne: moyenneDe(notes),
    classement: profils
      .map((p) => ({ numero: p.numero, nom: p.nom, age: p.age, moyenne: p.moyenne, fin: p.fin.title }))
      .sort((a, b) => b.moyenne - a.moyenne || a.numero - b.numero),
    severite,
    zeros: notes.length ? (notes.filter((n) => n === MIN_SCORE).length / notes.length) * 100 : 0,
    extremes: notes.length ? (notes.filter((n) => n <= 1 || n >= 13).length / notes.length) * 100 : 0,
    moyenneRouge: moyenneOuNull(jugements.filter((j) => j.type === 'negative').map((j) => j.note)),
    moyenneVerte: moyenneOuNull(jugements.filter((j) => j.type === 'positive').map((j) => j.note)),
    redhibitoires: jugements.filter((j) => j.note <= 1).sort((a, b) => a.note - b.note),
    coupsDeCoeur: jugements.filter((j) => j.note >= 13).sort((a, b) => b.note - a.note),
    categories: categoriesDe(jugements),
    intransigeance: plusDur && (plusDur.ecart as number) <= -2 ? plusDur : null,
    angleMort: plusDoux && (plusDoux.ecart as number) >= 2 ? plusDoux : null,
    dispersion: ecartType(notes),
  };

  return { ...sansArchetype, archetype: choisirArchetype(sansArchetype) };
}

interface ArchetypeCandidat extends Archetype {
  when: (b: Omit<Bilan, 'archetype'>) => boolean;
}

/** Le premier qui s'applique gagne : les portraits les plus marqués d'abord. */
const ARCHETYPES: ArchetypeCandidat[] = [
  {
    key: 'bourreau',
    title: 'LE BOURREAU',
    tagline: 'Un red flag, chez toi, c’est déjà presque zéro. Personne ne passe la moyenne.',
    emoji: '🪓',
    when: (b) => b.noteMoyenne <= 2.5 && b.jugements >= 10,
  },
  {
    key: 'binaire',
    title: 'LE BINAIRE',
    tagline: 'Zéro ou quinze, jamais six. Pour toi, une info compte énormément ou pas du tout.',
    emoji: '🎚️',
    when: (b) => b.extremes >= 60 && b.jugements >= 10,
  },
  {
    key: 'coeur-d-artichaut',
    title: "LE CŒUR D'ARTICHAUT",
    tagline: 'Une qualité, et tu t’envoles. Un mec qui cuisine bien, et c’est 14/10.',
    emoji: '💘',
    when: (b) => (b.moyenneVerte ?? 0) >= 13,
  },
  {
    key: 'insensible-au-vert',
    title: 'INSENSIBLE AU VERT',
    tagline: 'Les qualités glissent sur toi. Être bien, chez toi, c’est le minimum.',
    emoji: '🧊',
    when: (b) => b.moyenneVerte !== null && b.moyenneVerte <= 10.3 && b.coupsDeCoeur.length === 0 && b.jugements >= 10,
  },
  {
    key: 'procureur',
    title: 'LE PROCUREUR',
    tagline: 'Tu notes chaque révélation bien plus bas que tout le monde. Rien ne t’échappe.',
    emoji: '⚖️',
    when: (b) => (b.severite?.ecart ?? 0) <= -1.5,
  },
  {
    key: 'avocat',
    title: "L'AVOCAT COMMIS D'OFFICE",
    tagline: 'Tout le monde condamne, tu plaides. Tu trouves toujours une circonstance.',
    emoji: '🕊️',
    when: (b) => (b.severite?.ecart ?? 0) >= 1.5,
  },
  {
    key: 'tiede',
    title: 'LE GRAND TIÈDE',
    tagline: 'Jamais de zéro, jamais de dix. Tu ne t’engages sur rien.',
    emoji: '🫤',
    when: (b) => b.zeros === 0 && b.extremes === 0 && b.dispersion < 1.5 && b.jugements >= 10,
  },
  {
    key: 'romantique',
    title: 'LE ROMANTIQUE INCURABLE',
    tagline: 'Tu vois le meilleur en chacun. C’est très beau. C’est aussi comme ça qu’on se fait avoir.',
    emoji: '🌹',
    when: (b) => b.noteMoyenne >= 7,
  },
  {
    key: 'comptable',
    title: 'LE COMPTABLE',
    tagline: 'Tu notes exactement comme tout le monde. Statistiquement, tu es la moyenne.',
    emoji: '📊',
    // Même seuil que « comme la moyenne » dans `phraseSeverite` : le portrait
    // et la phrase ne doivent pas se contredire à l'écran.
    when: (b) => b.severite !== null && Math.abs(b.severite.ecart) <= 0.3,
  },
  {
    key: 'exigeant',
    title: "L'EXIGEANT",
    tagline: 'Tu as des critères. Beaucoup de critères. Trop, diraient certains.',
    emoji: '🔍',
    when: (b) => b.noteMoyenne <= 4,
  },
  {
    key: 'jure',
    title: 'LE JURÉ',
    tagline: 'Tu pèses chaque info, une par une, et tu tranches. Sans état d’âme apparent.',
    emoji: '🧑‍⚖️',
    when: () => true,
  },
];

export function choisirArchetype(b: Omit<Bilan, 'archetype'>): Archetype {
  const trouve = ARCHETYPES.find((a) => a.when(b)) ?? ARCHETYPES[ARCHETYPES.length - 1];
  const { when: _when, ...archetype } = trouve;
  void _when;
  return archetype;
}

/** La phrase de sévérité, en clair. */
export function phraseSeverite(s: Severite | null): string | null {
  if (!s) return null;
  const e = Math.abs(s.ecart).toFixed(1).replace('.', ',');
  const pts = Math.abs(s.ecart) >= 2 ? 'points' : 'point';
  if (s.ecart <= -2) return `Tu mets ${e} ${pts} de moins que les autres à chaque révélation. Tu es extrêmement sévère.`;
  if (s.ecart <= -0.8) return `Tu es plus sévère que la moyenne : ${e} ${pts} de moins à chaque révélation.`;
  if (s.ecart < -0.3) return 'Tu es un peu plus dur que la moyenne, sans excès.';
  if (s.ecart <= 0.3) return 'Tu notes comme la moyenne des joueurs, à un cheveu près.';
  if (s.ecart < 1.5) return `Tu es plus indulgent que la moyenne : ${e} ${pts} de plus à chaque révélation.`;
  return `Tu donnes ${e} points de plus que tout le monde à chaque révélation. Personne n'est aussi gentil que toi.`;
}

/** Libellés lisibles des catégories du catalogue. */
const CATEGORIES: Record<string, string> = {
  general: 'En général',
  politique: 'La politique',
  caractere: 'Le caractère',
  dating: 'Les relations',
  lifestyle: "L'hygiène de vie",
  social: 'Le rapport aux autres',
  argent: "L'argent",
  travail: 'Le travail',
  sante: 'La santé',
  famille: 'La famille',
};

export function libelleCategorie(category: string): string {
  return CATEGORIES[category] ?? category;
}
