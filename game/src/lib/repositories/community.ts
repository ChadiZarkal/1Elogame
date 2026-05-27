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
    timestamp: new Date(row.created_at as string).getTime(),
  }));
}

/** Save a new community submission. */
export async function saveSubmission(text: string, verdict: 'red' | 'green', justification?: string): Promise<CommunitySubmission> {
  const sanitized = sanitizeText(text).slice(0, MAX_FLAGORNOT_TEXT_LENGTH);

  if (isMockMode()) {
    const submission: CommunitySubmission = {
      id: `mock-${Date.now()}`,
      text: sanitized,
      verdict,
      justification,
      timestamp: Date.now(),
    };
    mockCommunityStore.push(submission);
    // Keep max 100 entries
    if (mockCommunityStore.length > 100) mockCommunityStore.splice(0, mockCommunityStore.length - 100);
    return submission;
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { error } = await typedInsert(supabase, 'flagornot_submissions', { text: sanitized, verdict, justification: justification || null });
  if (error) throw new Error(`DB error saving submission: ${error.message}`);
  return { id: `new-${Date.now()}`, text: sanitized, verdict, justification, timestamp: Date.now() };
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
    timestamp: new Date(row.created_at as string).getTime(),
  }));

  return { submissions, total: count ?? 0 };
}
