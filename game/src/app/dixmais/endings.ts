/**
 * @module dixmais/endings
 * Fin de manche : lecture de la trajectoire, puis choix de la fin.
 *
 * POURQUOI « LE COUPERET » SORTAIT PRESQUE TOUJOURS
 *   L'ancienne version était une cascade de `if` dont le tout premier test
 *   était l'élimination. Or une manche se termine à zéro très souvent : le
 *   catalogue compte deux fois plus de red flags que de green flags, et les
 *   phrases les plus dures font éliminer trois joueurs sur quatre. La fin, qui
 *   devait être la récompense de la manche, était devenue la partie la plus
 *   prévisible du jeu.
 *
 * COMMENT LA FIN EST CHOISIE MAINTENANT
 *   1. chaque fin déclare *quand elle s'applique* (`when`) et *à quel point
 *      elle est spécifique* (`tier`) ;
 *   2. on ne retient que le palier le plus élevé parmi les fins éligibles —
 *      une observation précise prime toujours sur un simple palier de note ;
 *   3. on écarte celles qui viennent de sortir, puis on tire dans ce qui reste
 *      avec une graine déduite de la manche. Deux joueurs sur la même manche
 *      voient la même fin ; deux manches de suite n'en voient pas deux
 *      identiques.
 *
 *   L'élimination se décline à elle seule en neuf fins : *la façon* dont on
 *   tombe à zéro raconte quelque chose, et ce n'était pas exploité.
 */

import { START_SCORE } from './scale';

export interface Ending {
  key: string;
  title: string;
  subtitle: string;
  /** Déclenche les confettis / la secousse sur l'écran de verdict. */
  tone: 'brutal' | 'triumphant' | 'neutral';
}

export interface Trajectory {
  /** Note après chaque révélation, précédée du 10 de départ. */
  path: number[];
  final: number;
  lowest: number;
  eliminated: boolean;
  /** Plus grosse perte sur une seule révélation. */
  steepest: number;
  /** Index de la révélation qui a le plus coûté. */
  steepestIndex: number;
  /** La note est remontée après être descendue. */
  recovered: boolean;
}

export function readTrajectory(ratings: number[]): Trajectory {
  const path = [START_SCORE, ...ratings];
  const final = ratings.at(-1) ?? START_SCORE;
  const lowest = ratings.length ? Math.min(...ratings) : START_SCORE;

  let steepest = 0;
  let steepestIndex = 0;
  for (let i = 1; i < path.length; i++) {
    const loss = path[i - 1] - path[i];
    if (loss > steepest) {
      steepest = loss;
      steepestIndex = i - 1;
    }
  }

  return {
    path,
    final,
    lowest,
    eliminated: final === 0,
    steepest,
    steepestIndex,
    recovered: final > lowest + 1,
  };
}

// ---------------------------------------------------------------------------
// Contexte d'une fin
// ---------------------------------------------------------------------------

export interface PlayedStatement {
  id: string;
  text: string;
  type: 'positive' | 'negative';
  category: string;
}

export interface EndingContext {
  traj: Trajectory;
  /** Les phrases réellement montrées, dans l'ordre. L'élimination interrompt la
   * manche : les suivantes n'ont jamais été lues. */
  played: PlayedStatement[];
  /** Variation infligée par le joueur à chaque révélation. */
  deltas: number[];
  /** Variation moyenne des autres joueurs, `null` quand les votes manquent. */
  community: (number | null)[];
}

/** Tronque une phrase pour l'insérer dans un sous-titre sans le faire déborder. */
function short(text: string, max = 46): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

/** Valeur absolue à la française — le signe est toujours porté par la phrase. */
function fr(n: number, digits = 1): string {
  return Math.abs(n).toFixed(digits).replace('.', ',');
}

/** Pluriel simple, la seule règle dont ce module ait besoin. */
function s(n: number): string {
  return Math.abs(n) >= 2 ? 's' : '';
}

/**
 * Écart de sévérité sur les phrases mesurables : négatif = le joueur retire
 * plus que les autres. `null` quand moins de deux phrases sont comparables —
 * la moyenne d'un échantillon de un, c'est l'échantillon.
 */
export function severityGap(
  deltas: number[],
  community: (number | null)[],
): { gap: number; mine: number; theirs: number; sample: number } | null {
  const pairs = deltas
    .map((d, i) => [d, community[i]] as const)
    .filter((p): p is readonly [number, number] => p[1] !== null && p[1] !== undefined);

  if (pairs.length < 2) return null;

  const mine = pairs.reduce((acc, p) => acc + p[0], 0) / pairs.length;
  const theirs = pairs.reduce((acc, p) => acc + p[1], 0) / pairs.length;
  return { gap: mine - theirs, mine, theirs, sample: pairs.length };
}

/** Perte totale, positive, du 10 de départ à la note finale. */
function totalLoss(ctx: EndingContext): number {
  return Math.max(0, START_SCORE - ctx.traj.final);
}

function lastPlayed(ctx: EndingContext): PlayedStatement | undefined {
  return ctx.played.at(-1);
}

// ---------------------------------------------------------------------------
// Catalogue des fins
// ---------------------------------------------------------------------------

interface Candidate {
  key: string;
  /** 3 = observation précise, 2 = forme de trajectoire, 1 = repli. */
  tier: 1 | 2 | 3;
  when: (ctx: EndingContext) => boolean;
  build: (ctx: EndingContext) => Omit<Ending, 'key'>;
}

const CANDIDATES: Candidate[] = [
  // ── Palier 3 : l'élimination, racontée par sa forme ──────────────────────
  {
    key: 'execution-sommaire',
    tier: 3,
    when: (c) => c.traj.eliminated && c.played.length === 1,
    build: (c) => ({
      title: 'EXÉCUTION SOMMAIRE',
      subtitle: `« ${short(lastPlayed(c)?.text ?? '')} ». Une phrase, et tu n'as pas voulu connaître la suite.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'trappe',
    tier: 3,
    when: (c) => c.traj.eliminated && c.traj.steepest >= 7 && c.played.length > 1,
    build: (c) => ({
      title: 'LA TRAPPE',
      subtitle: `Il était à ${c.traj.path[c.traj.path.length - 2] ?? START_SCORE}/10. Une phrase plus tard, il n'existe plus.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'goutte-eau',
    tier: 3,
    when: (c) => c.traj.eliminated && c.played.length >= 4 && c.traj.steepest <= 2,
    build: (c) => ({
      title: "LA GOUTTE D'EAU",
      subtitle: `${c.played.length} révélations encaissées, et c'est « ${short(lastPlayed(c)?.text ?? '', 34)} » qui a tout emporté.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'trop-tard',
    tier: 3,
    when: (c) => c.traj.eliminated && lastPlayed(c)?.type === 'positive',
    build: (c) => ({
      title: 'TROP TARD POUR LES QUALITÉS',
      subtitle: `« ${short(lastPlayed(c)?.text ?? '', 36)} » — et tu l'as mis à zéro quand même. Il n'y avait plus rien à sauver.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'seul-au-monde',
    tier: 3,
    when: (c) => {
      const fatal = c.community.at(-1);
      return c.traj.eliminated && typeof fatal === 'number' && fatal > -2;
    },
    build: (c) => {
      const fatal = c.community.at(-1) ?? 0;
      return {
        title: 'TU ES SEUL AU MONDE',
        subtitle: `Les autres retirent ${fr(fatal)} point${s(fatal)} sur cette phrase. Toi, tu l'as rayé de la carte.`,
        tone: 'brutal',
      };
    },
  },
  {
    key: 'descente',
    tier: 3,
    when: (c) => c.traj.eliminated && c.played.length >= 3 && c.traj.steepest <= 4,
    build: (c) => ({
      title: 'LA DESCENTE AUX ENFERS',
      subtitle: `Aucune phrase ne l'a tué. Toutes, si. ${c.played.length} petites déceptions, et zéro au bout.`,
      tone: 'brutal',
    }),
  },

  // ── Palier 2 : les formes de trajectoire ─────────────────────────────────
  {
    // Palier 3 comme les éliminations : une note qui remonte de trois points
    // est le retournement le plus rare du jeu. Laissée au palier 2, elle
    // perdait le tirage face à une simple grosse chute, qui elle est banale.
    key: 'remontada',
    tier: 3,
    when: (c) => c.traj.recovered && c.traj.final - c.traj.lowest >= 3,
    build: (c) => ({
      title: 'LA REMONTADA',
      subtitle: `Tombé à ${c.traj.lowest}, reparti à ${c.traj.final}. Il t'a retourné en ${c.played.length} phrases.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'execution',
    tier: 2,
    when: (c) => !c.traj.eliminated && c.traj.steepest >= 5,
    build: (c) => ({
      title: "L'EXÉCUTION",
      subtitle: `« ${short(c.played[c.traj.steepestIndex]?.text ?? '')} » lui a coûté ${c.traj.steepest} points d'un coup.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'un-seul-grief',
    tier: 2,
    when: (c) =>
      !c.traj.eliminated &&
      c.played.length >= 3 &&
      totalLoss(c) >= 4 &&
      c.traj.steepest >= totalLoss(c) * 0.7,
    build: (c) => ({
      title: 'UN SEUL GRIEF',
      subtitle: `Tout le reste passait. « ${short(c.played[c.traj.steepestIndex]?.text ?? '', 36)} », non.`,
      tone: 'neutral',
    }),
  },
  {
    key: 'metronome',
    tier: 2,
    when: (c) => c.deltas.length >= 3 && c.deltas[0] < 0 && c.deltas.every((d) => d === c.deltas[0]),
    build: (c) => ({
      title: 'LE MÉTRONOME',
      subtitle: `${fr(c.deltas[0], 0)} point${s(c.deltas[0])} à chaque phrase, sans jamais varier. Tu notes au kilomètre.`,
      tone: 'neutral',
    }),
  },
  {
    // Au moins une réaction quelque part : une manche entièrement immobile
    // n'est pas de l'impassibilité, c'est un sans-faute, et `pas-une-ride` le
    // dit mieux.
    key: 'impassible',
    tier: 2,
    when: (c) =>
      !c.traj.eliminated &&
      c.deltas.filter((d) => d === 0).length >= 3 &&
      c.deltas.some((d) => d !== 0),
    build: (c) => ({
      title: 'IMPASSIBLE',
      subtitle: `${c.deltas.filter((d) => d === 0).length} révélations sans bouger d'un point. Tu lisais, au moins ?`,
      tone: 'neutral',
    }),
  },
  {
    key: 'avocat',
    tier: 2,
    when: (c) => !c.traj.eliminated && (severityGap(c.deltas, c.community)?.gap ?? 0) >= 1.2,
    build: (c) => {
      const g = severityGap(c.deltas, c.community);
      return {
        title: "L'AVOCAT DE LA DÉFENSE",
        subtitle: `Sur les mêmes phrases, les autres retirent ${fr(g?.theirs ?? 0)}. Toi ${fr(g?.mine ?? 0)}. Tu lui cherches des excuses.`,
        tone: 'neutral',
      };
    },
  },
  {
    key: 'sans-pitie',
    tier: 2,
    when: (c) => !c.traj.eliminated && (severityGap(c.deltas, c.community)?.gap ?? 0) <= -1.2,
    build: (c) => {
      const g = severityGap(c.deltas, c.community);
      return {
        title: 'SANS PITIÉ',
        subtitle: `Les autres s'arrêtent à ${fr(g?.theirs ?? 0)}. Toi tu vas jusqu'à ${fr(g?.mine ?? 0)}, sans ciller.`,
        tone: 'brutal',
      };
    },
  },
  {
    key: 'rattrapage',
    tier: 2,
    when: (c) => c.traj.recovered,
    build: (c) => ({
      title: 'LE RATTRAPAGE',
      subtitle: `Tombé à ${c.traj.lowest}, remonté à ${c.traj.final}. Tu crois aux secondes chances, toi.`,
      tone: 'neutral',
    }),
  },

  // ── Palier 1 : replis d'élimination ──────────────────────────────────────
  //   Trois, et non un seul : c'est ce palier qui sort quand aucune
  //   observation précise ne s'applique, et c'est lui qui produisait la
  //   répétition. Même au pire, la fin alterne maintenant entre trois titres.
  {
    key: 'couperet',
    tier: 1,
    when: (c) => c.traj.eliminated,
    build: (c) => ({
      title: 'LE COUPERET',
      subtitle: `« ${short(lastPlayed(c)?.text ?? '')} » — et c'était terminé. Aucune négociation.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'dossier-clos',
    tier: 1,
    when: (c) => c.traj.eliminated,
    build: (c) => ({
      title: 'DOSSIER CLOS',
      subtitle: `Tu as arrêté de lire à la ${c.played.length}ᵉ phrase. C'était non, et c'était définitif.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'zero-absolu',
    tier: 1,
    when: (c) => c.traj.eliminated,
    build: (c) => ({
      title: 'ZÉRO ABSOLU',
      subtitle: `De 10 à 0 en ${c.played.length} phrase${s(c.played.length)}. Il n'y a rien en dessous.`,
      tone: 'brutal',
    }),
  },

  // ── Palier 1 : replis par palier de note ─────────────────────────────────
  {
    // Palier 2 : ne pas retirer un seul point sur toute une manche est une
    // observation, pas un palier de note. Au palier 1 elle partageait le
    // tirage avec « AVEUGLÉ », qui dit la même chose en moins juste.
    key: 'pas-une-ride',
    tier: 2,
    when: (c) => c.traj.final === START_SCORE,
    build: (c) => ({
      title: 'PAS UNE RIDE',
      subtitle: `${c.played.length} révélations, pas un point perdu. Soit c'est l'amour, soit tu n'as pas lu.`,
      tone: 'triumphant',
    }),
  },
  //   Les paliers ne se recouvrent plus : « LA CHUTE LIBRE » pouvait sortir
  //   sur un 9/10, son ancienne condition étant un simple « pas éliminé ».
  //   Et chaque palier porte au moins deux titres, sans quoi `avoid` n'a rien
  //   à proposer et la fin se répète — le défaut qu'on corrige.
  {
    key: 'aveugle',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 8,
    build: (c) => ({
      title: 'AVEUGLÉ',
      subtitle: `${c.played.length} révélations et toujours ${c.traj.final}/10. Tes potes commencent à s'inquiéter.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'blindage',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 8,
    build: (c) => ({
      title: "À L'ÉPREUVE DES BALLES",
      subtitle: `Tu lui as tout mis, il finit à ${c.traj.final}. Rien ne l'atteint, chez toi.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'malgre-tout',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 6 && c.traj.final < 8,
    build: (c) => ({
      title: 'MALGRÉ TOUT',
      subtitle: `Il encaisse ${c.played.length} révélations et finit encore à ${c.traj.final}. Solide.`,
      tone: 'triumphant',
    }),
  },
  {
    key: 'sen-tire-bien',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 6 && c.traj.final < 8,
    build: (c) => ({
      title: 'IL S’EN TIRE BIEN',
      subtitle: `${c.traj.final}/10 avec un dossier pareil. Tu as été large.`,
      tone: 'neutral',
    }),
  },
  {
    key: 'tiede',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 4 && c.traj.final < 6,
    build: (c) => ({
      title: 'LE GRAND TIÈDE',
      subtitle: `${c.traj.final}/10. Ni oui, ni non. Le verdict le plus lâche qui existe.`,
      tone: 'neutral',
    }),
  },
  {
    key: 'benefice-du-doute',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final >= 4 && c.traj.final < 6,
    build: (c) => ({
      title: 'LE BÉNÉFICE DU DOUTE',
      subtitle: `${c.traj.final}/10. Tu ne l'élimines pas, mais tu ne le défendrais devant personne.`,
      tone: 'neutral',
    }),
  },
  {
    key: 'chute',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final < 4,
    build: (c) => ({
      title: 'LA CHUTE LIBRE',
      subtitle: `10 → ${c.traj.final}. ${totalLoss(c)} point${s(totalLoss(c))} perdu${s(totalLoss(c))} en ${c.played.length} phrases.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'survivant',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final < 4,
    build: (c) => ({
      title: 'LE SURVIVANT',
      subtitle: `${c.traj.final}/10. Techniquement vivant. Humainement, c'est discutable.`,
      tone: 'brutal',
    }),
  },
  {
    key: 'ce-qui-en-reste',
    tier: 1,
    when: (c) => !c.traj.eliminated && c.traj.final < 4,
    build: (c) => ({
      title: 'CE QU’IL EN RESTE',
      subtitle: `${c.traj.final} point${s(c.traj.final)} sur dix. Tu lui as laissé le minimum syndical.`,
      tone: 'brutal',
    }),
  },
];

// ---------------------------------------------------------------------------
// Sélection
// ---------------------------------------------------------------------------

/**
 * Graine déduite du contenu de la manche.
 *
 * Un `Math.random()` suffirait à varier, mais la fin serait retirée à chaque
 * rendu — et cet écran en produit plusieurs, ne serait-ce qu'au retour des
 * confettis. Le titre changerait sous les yeux du joueur.
 */
function seedOf(ctx: EndingContext): number {
  let h = 2166136261;
  const source = `${ctx.played.map((p) => p.id).join('|')}#${ctx.deltas.join(',')}`;
  for (let i = 0; i < source.length; i++) {
    h ^= source.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * @param avoid Clés des dernières fins servies. Écartées tant qu'il reste autre
 *              chose — c'est ce qui empêche deux manches de suite de se
 *              terminer sur le même titre, le reproche principal fait à
 *              l'ancien écran.
 */
export function computeEnding(ctx: EndingContext, avoid: string[] = []): Ending {
  const eligible = CANDIDATES.filter((c) => c.when(ctx));

  // `chute` couvre tout ce qui n'est pas éliminé, `couperet` tout ce qui l'est :
  // le tableau ne peut pas être vide. La garde est là pour le jour où une
  // condition de repli serait resserrée par mégarde.
  if (eligible.length === 0) {
    const fallback = CANDIDATES[CANDIDATES.length - 1];
    return { key: fallback.key, ...fallback.build(ctx) };
  }

  // On descend de palier tant que le meilleur ne propose que des fins déjà
  // servies. Une observation précise mais répétée vaut moins qu'un repli
  // inédit : resservir le même titre est précisément ce qu'on corrige, et
  // certains paliers hauts n'ont qu'un seul candidat — « LA DESCENTE AUX
  // ENFERS » deux manches de suite est le même défaut que l'ancien
  // « LE COUPERET » systématique.
  const tiers = [...new Set(eligible.map((c) => c.tier))].sort((a, b) => b - a);
  const pool =
    tiers
      .map((tier) => eligible.filter((c) => c.tier === tier && !avoid.includes(c.key)))
      .find((candidates) => candidates.length > 0)
      ?? eligible.filter((c) => c.tier === tiers[0]);

  const chosen = pool[seedOf(ctx) % pool.length];
  return { key: chosen.key, ...chosen.build(ctx) };
}

/** Nombre de fins distinctes. Sert de garde-fou aux tests de variété. */
export const ENDING_COUNT = CANDIDATES.length;

// ---------------------------------------------------------------------------
// Comparaison avec la communauté
// ---------------------------------------------------------------------------

/**
 * En dessous de ce nombre de votes, la moyenne d'une phrase est trop bruitée
 * pour être opposée au joueur.
 */
export const MIN_VOTES_FOR_COMPARISON = 5;

export interface CommunityStat {
  /** Variation moyenne infligée par les autres joueurs, ou null si trop peu de votes. */
  avgDelta: number | null;
  /** Part des joueurs qui éliminent sur cette phrase, en %. */
  eliminationRate: number | null;
}

/**
 * Les statistiques sont déjà présentes sur les phrases renvoyées par l'API
 * (`select('*')`) : aucun appel supplémentaire n'est nécessaire.
 */
export function readCommunityStat(stmt: {
  votes_count?: number;
  total_delta?: number;
  elimination_count?: number;
  avg_delta?: number;
  elimination_rate?: number;
}): CommunityStat {
  const votes = stmt.votes_count ?? 0;
  if (votes < MIN_VOTES_FOR_COMPARISON) {
    return { avgDelta: null, eliminationRate: null };
  }
  return {
    avgDelta: stmt.avg_delta ?? (stmt.total_delta ?? 0) / votes,
    eliminationRate: stmt.elimination_rate ?? ((stmt.elimination_count ?? 0) / votes) * 100,
  };
}

/** Compare la sévérité du joueur à celle des autres, sur les phrases mesurables. */
export function severityLine(deltas: number[], community: (number | null)[]): string | null {
  const g = severityGap(deltas, community);
  if (!g) return null;

  if (g.gap < -0.6) return 'Tu notes plus sévèrement que la moyenne.';
  if (g.gap > 0.6) return 'Tu notes plus généreusement que la moyenne.';
  return 'Tu notes comme la moyenne des joueurs.';
}
