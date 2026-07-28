/**
 * @module dixmais/endings
 * Fins de manche et lecture de la trajectoire.
 *
 * L'ancien écran de fin affichait trois chiffres (nombre d'infos, minimum,
 * moyenne) : aucune conclusion, rien à raconter. Une manche se termine
 * maintenant sur une **fin nommée**, déduite de la forme de la chute, et sur la
 * comparaison avec les autres joueurs.
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

/** Tronque une phrase pour l'insérer dans un sous-titre sans le faire déborder. */
function short(text: string, max = 46): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * L'ordre des tests fait la qualité des fins : on privilégie l'événement
 * marquant (élimination, remontée, exécution en un coup) sur le simple palier
 * de note finale, qui ne sert que de repli.
 */
export function computeEnding(traj: Trajectory, texts: string[]): Ending {
  const { final, lowest, eliminated, steepest, steepestIndex, recovered } = traj;
  const count = texts.length;

  if (eliminated) {
    return {
      key: 'couperet',
      title: 'LE COUPERET',
      subtitle: `« ${short(texts.at(-1) ?? '')} » — et c'était terminé. Aucune négociation.`,
      tone: 'brutal',
    };
  }

  if (recovered) {
    return {
      key: 'rattrapage',
      title: 'LE RATTRAPAGE',
      subtitle: `Tombé à ${lowest}, remonté à ${final}. Tu crois aux secondes chances, toi.`,
      tone: 'neutral',
    };
  }

  if (steepest >= 5) {
    return {
      key: 'execution',
      title: "L'EXÉCUTION",
      subtitle: `« ${short(texts[steepestIndex] ?? '')} » lui a coûté ${steepest} points d'un seul coup.`,
      tone: 'brutal',
    };
  }

  if (final >= 9) {
    return {
      key: 'aveugle',
      title: 'AVEUGLÉ',
      subtitle: `${count} révélations et toujours ${final}/10. Tes potes commencent à s'inquiéter.`,
      tone: 'triumphant',
    };
  }

  if (final >= 7) {
    return {
      key: 'malgre-tout',
      title: 'MALGRÉ TOUT',
      subtitle: `Il encaisse ${count} révélations et finit encore à ${final}. Solide.`,
      tone: 'triumphant',
    };
  }

  if (final >= 4) {
    return {
      key: 'tiede',
      title: 'LE GRAND TIÈDE',
      subtitle: `${final}/10. Ni oui, ni non. Le verdict le plus lâche qui existe.`,
      tone: 'neutral',
    };
  }

  return {
    key: 'chute',
    title: 'LA CHUTE LIBRE',
    subtitle: `10 → ${final}. ${START_SCORE - final} points perdus en ${count} phrases.`,
    tone: 'brutal',
  };
}

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
  const pairs = deltas
    .map((d, i) => [d, community[i]] as const)
    .filter((p): p is readonly [number, number] => p[1] !== null);

  if (pairs.length < 2) return null;

  const mine = pairs.reduce((s, p) => s + p[0], 0) / pairs.length;
  const theirs = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;
  const gap = mine - theirs;

  if (gap < -0.6) return 'Tu notes plus sévèrement que la moyenne.';
  if (gap > 0.6) return 'Tu notes plus généreusement que la moyenne.';
  return 'Tu notes comme la moyenne des joueurs.';
}
