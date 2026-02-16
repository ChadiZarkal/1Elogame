import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { authenticateAdmin } from '@/lib/adminAuth';
import { elementUpdateSchema } from '@/lib/validations';
import { typedUpdate } from '@/lib/supabaseHelpers';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// PATCH: Update element
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = authenticateAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    // Validate with Zod schema
    const validation = elementUpdateSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Données invalides', errors),
        { status: 400 }
      );
    }
    
    const updatePayload = validation.data;

    if (isMockMode) {
      const { mockElements } = await import('@/lib/mockData');
      const index = mockElements.findIndex(e => e.id === id);
      
      if (index === -1) {
        return NextResponse.json(
          createApiError('NOT_FOUND', 'Élément non trouvé'),
          { status: 404 }
        );
      }

      // Update the mock element
      mockElements[index] = {
        ...mockElements[index],
        ...updatePayload,
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(
        createApiSuccess({ element: mockElements[index] })
      );
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const updateData = {
      ...updatePayload,
      updated_at: new Date().toISOString(),
    };

    const { data: element, error } = await typedUpdate(supabase, 'elements', updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating element:', error);
      return NextResponse.json(
        createApiError('DATABASE_ERROR', 'Erreur lors de la mise à jour'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiSuccess({ element })
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/elements/[id]:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}

// DELETE: Delete element (soft delete by setting actif = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = authenticateAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    if (isMockMode) {
      const { mockElements } = await import('@/lib/mockData');
      const index = mockElements.findIndex(e => e.id === id);
      
      if (index === -1) {
        return NextResponse.json(
          createApiError('NOT_FOUND', 'Élément non trouvé'),
          { status: 404 }
        );
      }

      // Soft delete
      mockElements[index].actif = false;
      mockElements[index].updated_at = new Date().toISOString();

      return NextResponse.json(
        createApiSuccess({ success: true })
      );
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const { error } = await typedUpdate(supabase, 'elements', { actif: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting element:', error);
      return NextResponse.json(
        createApiError('DATABASE_ERROR', 'Erreur lors de la suppression'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiSuccess({ success: true })
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/elements/[id]:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
