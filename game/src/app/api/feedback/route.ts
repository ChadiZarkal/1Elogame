import { NextRequest, NextResponse } from 'next/server';
import { feedbackSchema } from '@/lib/validations';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { typedUpdate, typedInsert } from '@/lib/supabaseHelpers';

export const dynamic = 'force-dynamic';

// Check if we're in mock mode
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

interface FeedbackRecord {
  id: string;
  stars_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

// In-memory feedback storage for mock mode
const mockFeedback: Map<string, FeedbackRecord> = new Map();

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => ({ 
        field: e.path.join('.'), 
        message: e.message 
      }));
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Données invalides', errors),
        { status: 400 }
      );
    }
    
    const { elementAId, elementBId, type } = validation.data;
    
    // Ensure consistent ordering (element_a_id < element_b_id)
    const [sortedA, sortedB] = elementAId < elementBId 
      ? [elementAId, elementBId] 
      : [elementBId, elementAId];
    
    const pairKey = `${sortedA}-${sortedB}`;
    
    if (isMockMode) {
      // Use in-memory storage for mock mode
      const existing = mockFeedback.get(pairKey);
      
      if (existing) {
        if (type === 'star') existing.stars_count += 1;
        else if (type === 'thumbs_up') existing.thumbs_up_count += 1;
        else if (type === 'thumbs_down') existing.thumbs_down_count += 1;
      } else {
        mockFeedback.set(pairKey, {
          id: pairKey,
          stars_count: type === 'star' ? 1 : 0,
          thumbs_up_count: type === 'thumbs_up' ? 1 : 0,
          thumbs_down_count: type === 'thumbs_down' ? 1 : 0,
        });
      }
      
      console.log(`[MOCK] Feedback recorded: ${type} for ${pairKey}`);
      return NextResponse.json(createApiSuccess({ success: true }));
    }
    
    // Production mode: Use Supabase
    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();
    
    // Determine which field to increment
    const incrementField = type === 'star' 
      ? 'stars_count' 
      : type === 'thumbs_up' 
        ? 'thumbs_up_count' 
        : 'thumbs_down_count';
    
    // Try to find existing feedback record
    const { data: existingData } = await supabase
      .from('duel_feedback')
      .select('id, stars_count, thumbs_up_count, thumbs_down_count')
      .eq('element_a_id', sortedA)
      .eq('element_b_id', sortedB)
      .single();
    
    const existing = existingData as unknown as FeedbackRecord | null;
    
    if (existing) {
      // Update existing record
      const currentValue = existing[incrementField as keyof FeedbackRecord] as number;
      const updateData = {
        [incrementField]: currentValue + 1,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await typedUpdate(supabase, 'duel_feedback', updateData)
        .eq('id', existing.id);
      
      if (updateError) {
        console.error('Error updating feedback:', updateError);
        return NextResponse.json(
          createApiError('DATABASE_ERROR', 'Erreur lors de la mise à jour'),
          { status: 500 }
        );
      }
    } else {
      // Insert new record
      const insertData = {
        element_a_id: sortedA,
        element_b_id: sortedB,
        stars_count: type === 'star' ? 1 : 0,
        thumbs_up_count: type === 'thumbs_up' ? 1 : 0,
        thumbs_down_count: type === 'thumbs_down' ? 1 : 0,
      };
      
      const { error: insertError } = await typedInsert(supabase, 'duel_feedback', insertData);
      
      if (insertError) {
        console.error('Error inserting feedback:', insertError);
        return NextResponse.json(
          createApiError('DATABASE_ERROR', 'Erreur lors de l\'enregistrement'),
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(createApiSuccess({ success: true }));
  } catch (error) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
