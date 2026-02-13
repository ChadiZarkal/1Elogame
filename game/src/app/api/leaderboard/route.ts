import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

    if (isMockMode) {
      const { getMockElements } = await import('@/lib/mockData');
      const elements = getMockElements();
      const active = elements.filter(e => e.actif);
      const sorted = active.sort((a, b) =>
        order === 'asc' ? a.elo_global - b.elo_global : b.elo_global - a.elo_global
      );
      const ranked = sorted.slice(0, limit).map((e, i) => ({
        rank: i + 1,
        texte: e.texte,
        categorie: e.categorie,
        elo_global: Math.round(e.elo_global),
        elo_homme: Math.round(e.elo_homme),
        elo_femme: Math.round(e.elo_femme),
        nb_participations: e.nb_participations,
      }));
      const totalVotes = active.reduce((sum, e) => sum + e.nb_participations, 0);
      return NextResponse.json(createApiSuccess({
        rankings: ranked,
        totalElements: active.length,
        totalVotes,
      }));
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('elements')
      .select('texte, categorie, elo_global, elo_homme, elo_femme, nb_participations')
      .eq('actif', true)
      .order('elo_global', { ascending: order === 'asc' })
      .limit(limit);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json(
        createApiError('SERVER_ERROR', 'Erreur lors du chargement'),
        { status: 500 }
      );
    }

    const elements = data as Array<{
      texte: string; categorie: string; elo_global: number;
      elo_homme: number; elo_femme: number; nb_participations: number;
    }>;

    const ranked = (elements || []).map((e, i) => ({
      rank: i + 1,
      texte: e.texte,
      categorie: e.categorie,
      elo_global: Math.round(e.elo_global),
      elo_homme: Math.round(e.elo_homme),
      elo_femme: Math.round(e.elo_femme),
      nb_participations: e.nb_participations,
    }));

    const { count } = await supabase
      .from('elements')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true);

    return NextResponse.json(createApiSuccess({
      rankings: ranked,
      totalElements: count ?? ranked.length,
      totalVotes: ranked.reduce((sum, e) => sum + e.nb_participations, 0),
    }));
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json(
      createApiError('SERVER_ERROR', 'Erreur interne'),
      { status: 500 }
    );
  }
}
