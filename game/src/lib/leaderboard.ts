/**
 * @module leaderboard
 * Mise en forme du classement, partagée entre la route API (pagination et
 * filtres côté client) et le rendu serveur de /classement.
 *
 * La page doit livrer sa première page de résultats directement dans le HTML :
 * sans cela, le crawler ne reçoit qu'un écran de chargement.
 */

import { getLeaderboard } from '@/lib/repositories';

export const LEADERBOARD_VIEWS = [
  'global',
  'homme',
  'femme',
  '16-18',
  '19-22',
  '23-26',
  '27+',
] as const;

export type LeaderboardView = (typeof LEADERBOARD_VIEWS)[number];

export interface RankEntry {
  rank: number;
  texte: string;
  categorie: string;
  tags: string[];
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  elo_16_18: number;
  elo_19_22: number;
  elo_23_26: number;
  elo_27plus: number;
  nb_participations: number;
}

export interface LeaderboardData {
  rankings: RankEntry[];
  totalElements: number;
  visibleElements: number;
  visibleVotes: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface LeaderboardPageOptions {
  sort?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  category?: string | null;
  tag?: string | null;
  view?: LeaderboardView;
  search?: string | null;
}

export function parseLeaderboardView(value: string | null): LeaderboardView {
  if (!value) return 'global';
  return (LEADERBOARD_VIEWS as readonly string[]).includes(value)
    ? (value as LeaderboardView)
    : 'global';
}

export interface GapEntry {
  texte: string;
  categorie: string;
  gap: number;
  scoreA: number;
  scoreB: number;
  nb_participations: number;
}

export interface SpreadEntry {
  texte: string;
  categorie: string;
  /** Écart entre le groupe le plus sévère et le plus indulgent. */
  spread: number;
  eloGlobal: number;
  nb_participations: number;
}

export interface ObservatoryData {
  totalElements: number;
  totalVotes: number;
  /** Écarts hommes / femmes, du plus marqué au moins marqué. */
  genderGaps: GapEntry[];
  /** Écarts 16-18 ans / 27 ans et plus. */
  ageGaps: GapEntry[];
  /** Comportements où les six groupes divergent le plus. */
  mostContested: SpreadEntry[];
  /** Comportements sur lesquels tous les groupes s'accordent. */
  mostConsensual: SpreadEntry[];
}

/**
 * Nombre de votes minimum pour qu'un écart soit retenu.
 * Les scores par sous-groupe reposent sur une fraction des votes d'un élément :
 * en dessous de ce seuil, l'écart relève surtout du bruit.
 */
const MIN_VOTES_FOR_GAP = 40;

/** Agrégats servant les pages éditoriales de l'Observatoire. */
export async function getObservatoryData(topN = 12): Promise<ObservatoryData> {
  const { elements, total } = await getLeaderboard({ sort: 'desc', limit: 1000, offset: 0 });

  const totalVotes = elements.reduce((sum, e) => sum + (e.nb_participations || 0), 0);
  const reliable = elements.filter((e) => (e.nb_participations || 0) >= MIN_VOTES_FOR_GAP);

  const buildGaps = (
    pick: (e: (typeof elements)[number]) => { a: number; b: number },
  ): GapEntry[] =>
    reliable
      .map((e) => {
        const { a, b } = pick(e);
        return {
          texte: e.texte,
          categorie: e.categorie,
          gap: Math.round(a - b),
          scoreA: Math.round(a),
          scoreB: Math.round(b),
          nb_participations: e.nb_participations,
        };
      })
      .sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))
      .slice(0, topN);

  // Amplitude entre le groupe le plus sévère et le plus indulgent : une mesure
  // directe du caractère clivant d'un comportement.
  const spreads: SpreadEntry[] = reliable
    .map((e) => {
      const scores = [
        e.elo_homme,
        e.elo_femme,
        e.elo_16_18,
        e.elo_19_22,
        e.elo_23_26,
        e.elo_27plus,
      ];
      return {
        texte: e.texte,
        categorie: e.categorie,
        spread: Math.round(Math.max(...scores) - Math.min(...scores)),
        eloGlobal: Math.round(e.elo_global),
        nb_participations: e.nb_participations,
      };
    })
    .sort((a, b) => b.spread - a.spread);

  const half = Math.min(topN, Math.floor(spreads.length / 2));

  return {
    totalElements: total,
    totalVotes,
    genderGaps: buildGaps((e) => ({
      a: e.elo_homme ?? e.elo_global,
      b: e.elo_femme ?? e.elo_global,
    })),
    ageGaps: buildGaps((e) => ({
      a: e.elo_16_18 ?? e.elo_global,
      b: e.elo_27plus ?? e.elo_global,
    })),
    // Les deux extrémités sont prises sur la même liste triée : on borne à la
    // moitié pour qu'un même comportement ne figure jamais dans les deux.
    mostContested: spreads.slice(0, half),
    mostConsensual: half > 0 ? spreads.slice(-half).reverse() : [],
  };
}

export async function getLeaderboardPage(
  options: LeaderboardPageOptions = {},
): Promise<LeaderboardData> {
  const sort = options.sort === 'asc' ? 'asc' : 'desc';
  const limit = Math.max(1, Math.min(options.limit ?? 30, 100));
  const offset = Math.max(0, options.offset ?? 0);
  const view = options.view ?? 'global';

  const { elements, total } = await getLeaderboard({
    sort,
    limit,
    offset,
    category: options.category ?? null,
    tag: options.tag ?? null,
    view,
    search: options.search ?? null,
  });

  const rankings: RankEntry[] = elements.map((e, i) => ({
    rank: offset + i + 1,
    texte: e.texte,
    categorie: e.categorie,
    tags: e.tags || [],
    elo_global: Math.round(e.elo_global),
    elo_homme: Math.round(e.elo_homme ?? e.elo_global),
    elo_femme: Math.round(e.elo_femme ?? e.elo_global),
    elo_16_18: Math.round(e.elo_16_18 ?? e.elo_global),
    elo_19_22: Math.round(e.elo_19_22 ?? e.elo_global),
    elo_23_26: Math.round(e.elo_23_26 ?? e.elo_global),
    elo_27plus: Math.round(e.elo_27plus ?? e.elo_global),
    nb_participations: e.nb_participations,
  }));

  return {
    rankings,
    totalElements: total,
    visibleElements: rankings.length,
    visibleVotes: elements.reduce((sum, e) => sum + (e.nb_participations || 0), 0),
    limit,
    offset,
    hasMore: offset + rankings.length < total,
  };
}
