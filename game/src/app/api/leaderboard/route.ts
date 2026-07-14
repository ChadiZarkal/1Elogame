import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getLeaderboard } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

const VIEW_VALUES = ['global', 'homme', 'femme', '16-18', '19-22', '23-26', '27+'] as const;
type LeaderboardView = typeof VIEW_VALUES[number];

function parseView(value: string | null): LeaderboardView {
  if (!value) return 'global';
  return (VIEW_VALUES as readonly string[]).includes(value) ? (value as LeaderboardView) : 'global';
}

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const parsedLimit = Number(searchParams.get('limit') || 30);
  const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 30, 100));
  const parsedOffset = Number(searchParams.get('offset') || 0);
  const offset = Math.max(0, Number.isFinite(parsedOffset) ? parsedOffset : 0);
  const category = searchParams.get('category') || null;
  const view = parseView(searchParams.get('view'));
  const search = searchParams.get('search')?.trim() || null;

  const { elements, total } = await getLeaderboard({
    sort,
    limit,
    offset,
    category,
    view,
    search,
  });

  const rankings = elements.map((e, i) => ({
    rank: offset + i + 1,
    texte: e.texte,
    categorie: e.categorie,
    elo_global: Math.round(e.elo_global),
    elo_homme: Math.round(e.elo_homme ?? e.elo_global),
    elo_femme: Math.round(e.elo_femme ?? e.elo_global),
    elo_16_18: Math.round(e.elo_16_18 ?? e.elo_global),
    elo_19_22: Math.round(e.elo_19_22 ?? e.elo_global),
    elo_23_26: Math.round(e.elo_23_26 ?? e.elo_global),
    elo_27plus: Math.round(e.elo_27plus ?? e.elo_global),
    nb_participations: e.nb_participations,
  }));

  const visibleVotes = elements.reduce((sum, e) => sum + (e.nb_participations || 0), 0);

  const response = apiSuccess({
    rankings,
    totalElements: total,
    visibleElements: rankings.length,
    visibleVotes,
    limit,
    offset,
    hasMore: offset + rankings.length < total,
  });

  // Cache for 30s on CDN, serve stale for 5 min while revalidating
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=300'
  );
  
  return response;
}, { rateLimit: true });
