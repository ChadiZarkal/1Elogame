/**
 * @module repositories/stats
 * Data access layer for stats and analytics aggregation.
 */

import { isMockMode } from '@/lib/apiHelpers';

// ---------------------------------------------------------------------------
// Public stats (homepage counters)
// ---------------------------------------------------------------------------

interface PublicStats {
  totalVotes: number;
  totalElements: number;
  estimatedPlayers: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    const elements = getMockElements().filter((e) => e.actif);
    const totalVotes = elements.reduce((sum, e) => sum + e.nb_participations, 0);
    return {
      totalVotes,
      totalElements: elements.length,
      estimatedPlayers: Math.max(12, Math.floor(totalVotes / 15)),
    };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Count directly from the votes table — same source as admin dashboard
  const [
    { count: totalVotes },
    { count: totalElements },
  ] = await Promise.all([
    supabase.from('votes').select('*', { count: 'exact', head: true }),
    supabase.from('elements').select('*', { count: 'exact', head: true }).eq('actif', true),
  ]);

  const votes = totalVotes ?? 0;
  return {
    totalVotes: votes,
    totalElements: totalElements ?? 0,
    estimatedPlayers: Math.max(1, Math.floor(votes / 15)),
  };
}

// ---------------------------------------------------------------------------
// Admin dashboard stats
// ---------------------------------------------------------------------------

interface AdminDashboardStats {
  totalElements: number;
  activeElements: number;
  totalVotes: number;
  todayVotes: number;
  topElement: { texte: string; elo_global: number } | null;
}

export async function getAdminStats(): Promise<AdminDashboardStats> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    const mockElements = getMockElements();
    const activeElements = mockElements.filter((e) => e.actif);
    const topElement = activeElements.reduce(
      (max, e) => (e.elo_global > (max?.elo_global ?? 0) ? e : max),
      activeElements[0] ?? null,
    );
    const totalVotes = mockElements.reduce((sum, e) => sum + e.nb_participations, 0);

    return {
      totalElements: mockElements.length,
      activeElements: activeElements.length,
      totalVotes,
      todayVotes: Math.floor(totalVotes * 0.1),
      topElement: topElement ? { texte: topElement.texte, elo_global: topElement.elo_global } : null,
    };
  }

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

  return {
    totalElements: totalElements ?? 0,
    activeElements: activeElements ?? 0,
    totalVotes: totalVotes ?? 0,
    todayVotes: todayVotes ?? 0,
    topElement: topElementData ?? null,
  };
}

// ---------------------------------------------------------------------------
// Daily vote counts (last 7 days) for admin dashboard chart
// ---------------------------------------------------------------------------

export interface DailyVoteStat {
  date: string;   // YYYY-MM-DD
  count: number;
}

export async function getDailyVoteStats(): Promise<DailyVoteStat[]> {
  if (isMockMode()) {
    // Generate mock data for 7 days
    const days: DailyVoteStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(20 + Math.random() * 80),
      });
    }
    return days;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Query votes grouped by day for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('votes')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true }) as { data: { created_at: string }[] | null; error: unknown };

  // Group by date
  const countsByDate: Record<string, number> = {};

  // Initialize all 7 days to 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    countsByDate[d.toISOString().split('T')[0]] = 0;
  }

  if (data && !error) {
    for (const vote of data) {
      const dateStr = new Date(vote.created_at).toISOString().split('T')[0];
      if (dateStr in countsByDate) {
        countsByDate[dateStr]++;
      }
    }
  }

  return Object.entries(countsByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
