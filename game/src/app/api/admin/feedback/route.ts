import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const supabase = createServerClient();

  // Fetch all feedback with element texts via joins
  const { data, error } = await (supabase.from('duel_feedback') as any)
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

  // Flatten the joined data
  const feedback = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    element_a_texte: (row.element_a as Record<string, string>)?.texte || 'Élément inconnu',
    element_b_texte: (row.element_b as Record<string, string>)?.texte || 'Élément inconnu',
    stars_count: row.stars_count || 0,
    thumbs_up_count: row.thumbs_up_count || 0,
    thumbs_down_count: row.thumbs_down_count || 0,
  }));

  return apiSuccess(feedback);
}, { requireAdmin: true });
