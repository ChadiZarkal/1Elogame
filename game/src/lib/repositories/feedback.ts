/**
 * @module repositories/feedback
 * Data access layer for duel feedback (stars, thumbs).
 */

import { isMockMode } from '@/lib/apiHelpers';
import { FeedbackType } from '@/types/game';
import { getPairKey } from '@/lib/utils';

// In-memory store for mock mode
const mockFeedback = new Map<string, { stars_count: number; thumbs_up_count: number; thumbs_down_count: number }>();

/** Row shape for the duel_feedback table. */
interface FeedbackRow {
  id: string;
  stars_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

/** Column name for a feedback type. */
const FEEDBACK_COLUMNS: Record<FeedbackType, string> = {
  star: 'stars_count',
  thumbs_up: 'thumbs_up_count',
  thumbs_down: 'thumbs_down_count',
};

/**
 * Record a feedback action (star, thumbs_up, thumbs_down) for a duel pair.
 * Returns the updated counts.
 */
export async function upsertFeedback(
  elementAId: string,
  elementBId: string,
  type: FeedbackType,
): Promise<{ stars_count: number; thumbs_up_count: number; thumbs_down_count: number }> {
  const column = FEEDBACK_COLUMNS[type];
  if (!column) throw new Error(`Unknown feedback type: ${type}`);

  if (isMockMode()) {
    const key = getPairKey(elementAId, elementBId);
    const current = mockFeedback.get(key) || { stars_count: 0, thumbs_up_count: 0, thumbs_down_count: 0 };
    current[column as keyof typeof current] += 1;
    mockFeedback.set(key, current);
    return current;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Sort IDs for consistent pair key
  const [sortedA, sortedB] = elementAId < elementBId ? [elementAId, elementBId] : [elementBId, elementAId];

  // Try atomic RPC first (avoids race conditions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('increment_feedback', {
    p_element_a_id: sortedA,
    p_element_b_id: sortedB,
    p_column: column,
  });

  if (!rpcError && rpcResult && rpcResult.length > 0) {
    return rpcResult[0];
  }

  // Fallback: upsert with ON CONFLICT (still better than select-then-update)
  const newRecord = {
    element_a_id: sortedA,
    element_b_id: sortedB,
    stars_count: type === 'star' ? 1 : 0,
    thumbs_up_count: type === 'thumbs_up' ? 1 : 0,
    thumbs_down_count: type === 'thumbs_down' ? 1 : 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: upserted } = await (supabase.from('duel_feedback') as any)
    .upsert(newRecord, { onConflict: 'element_a_id,element_b_id' })
    .select('stars_count, thumbs_up_count, thumbs_down_count')
    .single();

  if (upserted) return upserted;

  // Final fallback: original select-then-update
  const { data: existing } = await supabase
    .from('duel_feedback')
    .select('id, stars_count, thumbs_up_count, thumbs_down_count')
    .eq('element_a_id', sortedA)
    .eq('element_b_id', sortedB)
    .single() as { data: FeedbackRow | null };

  if (existing) {
    const newValue = (existing[column as keyof FeedbackRow] as number) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('duel_feedback') as any).update({ [column]: newValue }).eq('id', existing.id);
    return { stars_count: existing.stars_count, thumbs_up_count: existing.thumbs_up_count, thumbs_down_count: existing.thumbs_down_count, [column]: newValue };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('duel_feedback') as any).insert(newRecord);
  return { stars_count: newRecord.stars_count, thumbs_up_count: newRecord.thumbs_up_count, thumbs_down_count: newRecord.thumbs_down_count };
}
