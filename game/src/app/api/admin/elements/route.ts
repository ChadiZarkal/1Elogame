import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { Element, Categorie } from '@/types';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Simple token validation
function isValidToken(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  return token.startsWith('admin_');
}

// GET: List all elements
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!isValidToken(authHeader)) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'Token invalide'),
        { status: 401 }
      );
    }

    if (isMockMode) {
      const { mockElements } = await import('@/lib/mockData');
      return NextResponse.json(
        createApiSuccess({ elements: mockElements })
      );
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const { data: elements, error } = await supabase
      .from('elements')
      .select('*')
      .order('elo_global', { ascending: false });

    if (error) {
      console.error('Error fetching elements:', error);
      return NextResponse.json(
        createApiError('DATABASE_ERROR', 'Erreur de base de données'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiSuccess({ elements: elements as Element[] })
    );
  } catch (error) {
    console.error('Error in GET /api/admin/elements:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}

// POST: Create new element
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!isValidToken(authHeader)) {
      return NextResponse.json(
        createApiError('UNAUTHORIZED', 'Token invalide'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { texte, categorie, niveau_provocation } = body as {
      texte: string;
      categorie: Categorie;
      niveau_provocation: 1 | 2 | 3 | 4;
    };

    if (!texte || !categorie) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Texte et catégorie requis'),
        { status: 400 }
      );
    }

    if (isMockMode) {
      const { mockElements } = await import('@/lib/mockData');
      const newElement: Element = {
        id: `mock_${Date.now()}`,
        texte,
        categorie,
        niveau_provocation: niveau_provocation || 2,
        actif: true,
        elo_global: 1000,
        elo_homme: 1000,
        elo_femme: 1000,
        elo_nonbinaire: 1000,
        elo_autre: 1000,
        elo_16_18: 1000,
        elo_19_22: 1000,
        elo_23_26: 1000,
        elo_27plus: 1000,
        nb_participations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockElements.push(newElement);
      return NextResponse.json(
        createApiSuccess({ element: newElement }),
        { status: 201 }
      );
    }

    const { createServerClient } = await import('@/lib/supabase');
    const supabase = createServerClient();

    const { data: element, error } = await supabase
      .from('elements')
      .insert({
        texte,
        categorie,
        niveau_provocation: niveau_provocation || 2,
        actif: true,
        elo_global: 1000,
        elo_homme: 1000,
        elo_femme: 1000,
        elo_nonbinaire: 1000,
        elo_autre: 1000,
        elo_16_18: 1000,
        elo_19_22: 1000,
        elo_23_26: 1000,
        elo_27plus: 1000,
        nb_participations: 0,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating element:', error);
      return NextResponse.json(
        createApiError('DATABASE_ERROR', 'Erreur lors de la création'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiSuccess({ element }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/elements:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
