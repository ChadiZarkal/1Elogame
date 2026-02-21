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
    timestamp: new Date(row.created_at as string).getTime(),
  }));
}

/** Save a new community submission. */
export async function saveSubmission(text: string, verdict: 'red' | 'green'): Promise<CommunitySubmission> {
  const sanitized = sanitizeText(text).slice(0, MAX_FLAGORNOT_TEXT_LENGTH);

  if (isMockMode()) {
    const submission: CommunitySubmission = {
      id: `mock-${Date.now()}`,
      text: sanitized,
      verdict,
      timestamp: Date.now(),
    };
    mockCommunityStore.push(submission);
    // Keep max 100 entries
    if (mockCommunityStore.length > 100) mockCommunityStore.splice(0, mockCommunityStore.length - 100);
    return submission;
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { error } = await typedInsert(supabase, 'flagornot_submissions', { text: sanitized, verdict });
  if (error) throw new Error(`DB error saving submission: ${error.message}`);
  return { id: `new-${Date.now()}`, text: sanitized, verdict, timestamp: Date.now() };
}
