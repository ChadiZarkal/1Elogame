import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getLeaderboard } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
  const category = searchParams.get('category') || null;

  const elements = await getLeaderboard({ sort, limit, category });

  const rankings = elements.map((e, i) => ({
    rank: i + 1,
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

  const totalVotes = elements.reduce((sum, e) => sum + (e.nb_participations || 0), 0);

  return apiSuccess({ rankings, totalElements: elements.length, totalVotes });
}, { rateLimit: true });
