/**
 * @module repositories/community
 * Data access layer for Flag or Not community submissions.
 */

import { isMockMode } from '@/lib/apiHelpers';
import type { CommunitySubmission } from '@/types/analytics';
import { sanitizeText } from '@/lib/sanitize';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';

// In-memory store for mock mode
const mockCommunityStore: CommunitySubmission[] = [];

function hasMissingColumnError(message: string, columnName: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes(`column "${columnName.toLowerCase()}"`) && normalized.includes('does not exist');
}

function shouldRetryWithoutOptionalColumns(message: string): boolean {
  return hasMissingColumnError(message, 'justification') || hasMissingColumnError(message, 'gender');
}

/** Get recent community submissions. */
export async function getRecentSubmissions(limit = 20): Promise<CommunitySubmission[]> {
  if (isMockMode()) {
    return mockCommunityStore.slice(-limit).reverse();
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('flagornot_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`DB error fetching submissions: ${error.message}`);
  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    text: row.text as string,
    verdict: row.verdict as 'red' | 'green',
    justification: (row.justification as string) || undefined,
    gender: (row.gender as 'homme' | 'femme' | 'autre') || undefined,
    timestamp: new Date(row.created_at as string).getTime(),
  }));
}

/** Save a new community submission. */
export async function saveSubmission(text: string, verdict: 'red' | 'green', justification?: string, gender?: 'homme' | 'femme' | 'autre'): Promise<CommunitySubmission> {
  const sanitized = sanitizeText(text).slice(0, MAX_FLAGORNOT_TEXT_LENGTH);

  if (isMockMode()) {
    const submission: CommunitySubmission = {
      id: `mock-${Date.now()}`,
      text: sanitized,
      verdict,
      justification,
      gender,
      timestamp: Date.now(),
    };
    mockCommunityStore.push(submission);
    // Keep max 100 entries
    if (mockCommunityStore.length > 100) mockCommunityStore.splice(0, mockCommunityStore.length - 100);
    return submission;
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const fullInsert = await typedInsert(supabase, 'flagornot_submissions', {
    text: sanitized,
    verdict,
    justification: justification || null,
    gender: gender || null,
  });

  if (fullInsert.error) {
    if (!shouldRetryWithoutOptionalColumns(fullInsert.error.message)) {
      throw new Error(`DB error saving submission: ${fullInsert.error.message}`);
    }

    const fallbackInsert = await typedInsert(supabase, 'flagornot_submissions', {
      text: sanitized,
      verdict,
    });

    if (fallbackInsert.error) {
      throw new Error(`DB error saving submission: ${fallbackInsert.error.message}`);
    }
  }

  return { id: `new-${Date.now()}`, text: sanitized, verdict, justification, gender, timestamp: Date.now() };
}

/** Get global red/green verdict counts. */
export async function getGlobalVerdictCounts(): Promise<{ red: number; green: number }> {
  if (isMockMode()) {
    const red = mockCommunityStore.filter((s) => s.verdict === 'red').length;
    const green = mockCommunityStore.filter((s) => s.verdict === 'green').length;
    return { red, green };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const [redRes, greenRes] = await Promise.all([
    supabase.from('flagornot_submissions').select('*', { count: 'exact', head: true }).eq('verdict', 'red'),
    supabase.from('flagornot_submissions').select('*', { count: 'exact', head: true }).eq('verdict', 'green'),
  ]);

  if (redRes.error) throw new Error(`DB error counting red: ${redRes.error.message}`);
  if (greenRes.error) throw new Error(`DB error counting green: ${greenRes.error.message}`);

  return { red: redRes.count ?? 0, green: greenRes.count ?? 0 };
}

/** Admin: get all submissions with pagination. */
export async function getAllSubmissions(
  options: { limit?: number; offset?: number; verdict?: 'red' | 'green' | null; search?: string | null } = {}
): Promise<{ submissions: CommunitySubmission[]; total: number }> {
  const { limit = 50, offset = 0, verdict = null, search = null } = options;

  if (isMockMode()) {
    let results = [...mockCommunityStore].reverse();
    if (verdict) results = results.filter(s => s.verdict === verdict);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(s => s.text.toLowerCase().includes(q));
    }
    return { submissions: results.slice(offset, offset + limit), total: results.length };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  let query = supabase
    .from('flagornot_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (verdict) query = query.eq('verdict', verdict);
  if (search) query = query.ilike('text', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB error fetching all submissions: ${error.message}`);

  const submissions = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    text: row.text as string,
    verdict: row.verdict as 'red' | 'green',
    justification: (row.justification as string) || undefined,
    gender: (row.gender as 'homme' | 'femme' | 'autre') || undefined,
    timestamp: new Date(row.created_at as string).getTime(),
  }));

  return { submissions, total: count ?? 0 };
}

/** Get gender-based statistics for Oracle. */
export async function getGenderStats(): Promise<{
  total: number;
  byGender: { gender: string; total: number; red: number; green: number; redPercent: number }[];
  insights: string[];
}> {
  if (isMockMode()) {
    const genders = ['homme', 'femme', 'autre'] as const;
    const byGender = genders.map(g => {
      const items = mockCommunityStore.filter(s => s.gender === g);
      const red = items.filter(s => s.verdict === 'red').length;
      const green = items.filter(s => s.verdict === 'green').length;
      const total = items.length;
      return { gender: g, total, red, green, redPercent: total > 0 ? Math.round((red / total) * 100) : 0 };
    });
    return { total: mockCommunityStore.length, byGender, insights: generateInsights(byGender) };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Get counts grouped by gender and verdict
  const { data, error } = await supabase
    .from('flagornot_submissions')
    .select('gender, verdict')
    .not('gender', 'is', null);

  if (error) {
    if (hasMissingColumnError(error.message, 'gender')) {
      return {
        total: 0,
        byGender: [],
        insights: ['📊 Le suivi par genre n est pas encore actif sur cette base de donnees.'],
      };
    }
    throw new Error(`DB error fetching gender stats: ${error.message}`);
  }

  const counts: Record<string, { red: number; green: number }> = {};
  for (const row of (data || []) as Array<{ gender: string; verdict: string }>) {
    const g = row.gender as string;
    if (!counts[g]) counts[g] = { red: 0, green: 0 };
    if (row.verdict === 'red') counts[g].red++;
    else counts[g].green++;
  }

  const byGender = Object.entries(counts).map(([gender, { red, green }]) => {
    const total = red + green;
    return { gender, total, red, green, redPercent: total > 0 ? Math.round((red / total) * 100) : 0 };
  });

  // Sort by total desc
  byGender.sort((a, b) => b.total - a.total);

  const totalAll = byGender.reduce((sum, g) => sum + g.total, 0);

  return { total: totalAll, byGender, insights: generateInsights(byGender) };
}

function generateInsights(byGender: { gender: string; total: number; red: number; green: number; redPercent: number }[]): string[] {
  const insights: string[] = [];
  const homme = byGender.find(g => g.gender === 'homme');
  const femme = byGender.find(g => g.gender === 'femme');

  if (homme && femme && homme.total >= 3 && femme.total >= 3) {
    if (homme.redPercent > femme.redPercent) {
      const diff = homme.redPercent - femme.redPercent;
      insights.push(`🚩 Les hommes reçoivent ${diff}% plus de Red Flags que les femmes`);
    } else if (femme.redPercent > homme.redPercent) {
      const diff = femme.redPercent - homme.redPercent;
      insights.push(`🚩 Les femmes reçoivent ${diff}% plus de Red Flags que les hommes`);
    } else {
      insights.push(`⚖️ Hommes et femmes reçoivent autant de Red Flags`);
    }

    if (homme.total > femme.total) {
      const ratio = Math.round((homme.total / femme.total) * 10) / 10;
      insights.push(`♂️ Les hommes utilisent l'Oracle ${ratio}x plus que les femmes`);
    } else if (femme.total > homme.total) {
      const ratio = Math.round((femme.total / homme.total) * 10) / 10;
      insights.push(`♀️ Les femmes utilisent l'Oracle ${ratio}x plus que les hommes`);
    }

    const hommeGreenPct = homme.total > 0 ? Math.round((homme.green / homme.total) * 100) : 0;
    const femmeGreenPct = femme.total > 0 ? Math.round((femme.green / femme.total) * 100) : 0;
    if (hommeGreenPct > femmeGreenPct + 5) {
      insights.push(`🟢 Les hommes ont ${hommeGreenPct}% de Green Flags vs ${femmeGreenPct}% chez les femmes`);
    } else if (femmeGreenPct > hommeGreenPct + 5) {
      insights.push(`🟢 Les femmes ont ${femmeGreenPct}% de Green Flags vs ${hommeGreenPct}% chez les hommes`);
    }
  }

  if (insights.length === 0) {
    insights.push(`📊 Pas assez de données pour générer des insights (besoin d'au moins 3 réponses par genre)`);
  }

  return insights;
}
