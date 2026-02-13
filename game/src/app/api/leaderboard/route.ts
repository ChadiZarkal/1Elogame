import { NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET() {
  try {
    if (isMockMode) {
      const { getMockElements } = await import('@/lib/mockData');
      const elements = getMockElements();
      const active = elements.filter(e => e.actif);
      const ranked = active
        .sort((a, b) => b.elo_global - a.elo_global)
        .slice(0, 50)
        .map((e, i) => ({
          rank: i + 1,
          texte: e.texte,
          categorie: e.categorie,
          elo_global: Math.round(e.elo_global),
          elo_homme: Math.round(e.elo_homme),
          elo_femme: Math.round(e.elo_femme),
          nb_participations: e.nb_participations,
        }));
      return NextResponse.json(createApiSuccess({ rankings: ranked }));
    }

    // Production: Supabase
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('elements')
      .select('texte, categorie, elo_global, elo_homme, elo_femme, nb_participations')
      .eq('actif', true)
      .order('elo_global', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json(
        createApiError('SERVER_ERROR', 'Erreur lors du chargement'),
        { status: 500 }
      );
    }

    const elements = data as Array<{
      texte: string;
      categorie: string;
      elo_global: number;
      elo_homme: number;
      elo_femme: number;
      nb_participations: number;
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

    return NextResponse.json(createApiSuccess({ rankings: ranked }));
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json(
      createApiError('SERVER_ERROR', 'Erreur interne'),
      { status: 500 }
    );
  }
}
