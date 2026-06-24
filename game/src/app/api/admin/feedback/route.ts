import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { createServerClient } from '@/lib/supabase';

type FeedbackQueryAdapter = {
  from: (table: string) => {
    select: (query: string) => {
      order: (column: string, options: { ascending: boolean }) => {
        limit: (count: number) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
};

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const supabase = createServerClient();
  const queryAdapter = supabase as unknown as FeedbackQueryAdapter;

  // Fetch all feedback with element texts via joins
  const { data, error } = await queryAdapter.from('duel_feedback')
    .select(`
      id,
      element_a_id,
      element_b_id,
      stars_count,
      thumbs_up_count,
      thumbs_down_count,
      element_a:elements!duel_feedback_element_a_id_fkey(texte),
      element_b:elements!duel_feedback_element_b_id_fkey(texte)
    `)
    .order('stars_count', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`);
  }

  const asRecord = (value: unknown): Record<string, unknown> => (
    typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  );

  const asText = (value: unknown): string => {
    const obj = asRecord(value);
    return typeof obj.texte === 'string' ? obj.texte : 'Élément inconnu';
  };

  const asCount = (value: unknown): number => (
    typeof value === 'number' ? value : 0
  );

  // Flatten the joined data
  const feedback = (data || []).map((row) => {
    const entry = asRecord(row);
    return {
      id: entry.id,
      element_a_texte: asText(entry.element_a),
      element_b_texte: asText(entry.element_b),
      stars_count: asCount(entry.stars_count),
      thumbs_up_count: asCount(entry.thumbs_up_count),
      thumbs_down_count: asCount(entry.thumbs_down_count),
    };
  });

  return apiSuccess(feedback);
}, { requireAdmin: true });
