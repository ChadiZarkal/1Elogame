import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 60 requests per minute
    const rateLimited = checkRateLimit(request, 'public');
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
    const category = searchParams.get('category') || null; // Filter by category

    if (isMockMode) {
      const { getMockElements } = await import('@/lib/mockData');
      const elements = getMockElements();
      let active = elements.filter(e => e.actif);
      
      // Filter by category if specified
      if (category) {
        active = active.filter(e => e.categorie === category);
      }
      
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
        elo_16_18: Math.round(e.elo_16_18 ?? e.elo_global),
        elo_19_22: Math.round(e.elo_19_22 ?? e.elo_global),
        elo_23_26: Math.round(e.elo_23_26 ?? e.elo_global),
        elo_27plus: Math.round(e.elo_27plus ?? e.elo_global),
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
    
    let query = supabase
      .from('elements')
      .select('texte, categorie, elo_global, elo_homme, elo_femme, elo_16_18, elo_19_22, elo_23_26, elo_27plus, nb_participations')
      .eq('actif', true);
    
    // Filter by category if specified
    if (category) {
      query = query.eq('categorie', category);
    }
    
    const { data, error } = await query
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
      elo_homme: number; elo_femme: number;
      elo_16_18: number; elo_19_22: number; elo_23_26: number; elo_27plus: number;
      nb_participations: number;
    }>;

    const ranked = (elements || []).map((e, i) => ({
      rank: i + 1,
      texte: e.texte,
      categorie: e.categorie,
      elo_global: Math.round(e.elo_global),
      elo_homme: Math.round(e.elo_homme),
      elo_femme: Math.round(e.elo_femme),
      elo_16_18: Math.round(e.elo_16_18 ?? e.elo_global),
      elo_19_22: Math.round(e.elo_19_22 ?? e.elo_global),
      elo_23_26: Math.round(e.elo_23_26 ?? e.elo_global),
      elo_27plus: Math.round(e.elo_27plus ?? e.elo_global),
      nb_participations: e.nb_participations,
    }));

    const { count: totalElements } = await supabase
      .from('elements')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true);

    // Count votes from source of truth: votes table (not from nb_participations)
    const { count: totalVotesCount } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json(createApiSuccess({
      rankings: ranked,
      totalElements: totalElements ?? ranked.length,
      totalVotes: totalVotesCount ?? 0,
    }));
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json(
      createApiError('SERVER_ERROR', 'Erreur interne'),
      { status: 500 }
    );
  }
}
