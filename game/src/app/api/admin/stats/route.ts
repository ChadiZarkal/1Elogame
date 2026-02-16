import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { authenticateAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Check if we're in mock mode
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  try {
    // Validate admin token
    const authError = authenticateAdmin(request);
    if (authError) return authError;

    if (isMockMode) {
      // Return mock statistics
      const { mockElements } = await import('@/lib/mockData');
      const activeElements = mockElements.filter(e => e.actif);
      const topElement = activeElements.reduce((max, e) => 
        e.elo_global > (max?.elo_global ?? 0) ? e : max, activeElements[0] ?? null
      );

      const totalVotes = mockElements.reduce((sum, e) => sum + e.nb_participations, 0);
      
      return NextResponse.json(
        createApiSuccess({
          totalElements: mockElements.length,
          activeElements: activeElements.length,
          totalVotes,
          todayVotes: Math.floor(totalVotes * 0.1), // Deterministic: ~10% of total
          topElement: topElement ? {
            texte: topElement.texte,
            elo_global: topElement.elo_global,
          } : null,
        })
      );
    }

    // Production mode: Use Supabase — parallelize all queries
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalElements },
      { count: activeElements },
      { count: totalVotes },
      { count: todayVotes },
      { data: topElementData },
    ] = await Promise.all([
      supabase.from('elements').select('*', { count: 'exact', head: true }),
      supabase.from('elements').select('*', { count: 'exact', head: true }).eq('actif', true),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('elements').select('texte, elo_global').eq('actif', true).order('elo_global', { ascending: false }).limit(1).single(),
    ]);

    return NextResponse.json(
      createApiSuccess({
        totalElements: totalElements ?? 0,
        activeElements: activeElements ?? 0,
        totalVotes: totalVotes ?? 0,
        todayVotes: todayVotes ?? 0,
        topElement: topElementData ?? null,
      })
    );
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
