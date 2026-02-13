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
      const totalVotes = active.reduce((sum, e) => sum + e.nb_participations, 0);
      return NextResponse.json(createApiSuccess({
        totalVotes,
        totalElements: active.length,
        estimatedPlayers: Math.max(12, Math.floor(totalVotes / 15)),
      }));
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('elements')
      .select('nb_participations')
      .eq('actif', true);

    if (error) throw error;

    const totalVotes = (data || []).reduce((sum: number, e: { nb_participations: number }) => sum + (e.nb_participations || 0), 0);
    const totalElements = (data || []).length;

    return NextResponse.json(createApiSuccess({
      totalVotes,
      totalElements,
      estimatedPlayers: Math.max(1, Math.floor(totalVotes / 15)),
    }));
  } catch (err) {
    console.error('Public stats error:', err);
    return NextResponse.json(createApiError('SERVER_ERROR', 'Erreur'), { status: 500 });
  }
}
