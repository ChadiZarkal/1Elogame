import { NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { authenticateAdmin } from '@/lib/adminAuth';
import { elementCreateSchema } from '@/lib/validations';
import { typedInsert } from '@/lib/supabaseHelpers';
import { Element } from '@/types';

export const dynamic = 'force-dynamic';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// GET: List all elements
export async function GET(request: NextRequest) {
  try {
    const authError = authenticateAdmin(request);
    if (authError) return authError;

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

    // Compute per-segment participation counts from votes table (source of truth)
    // This works even if nb_participations_* columns don't exist on elements table
    
    // Get all votes to compute participation by segment
    const { data: votesRaw } = await supabase
      .from('votes')
      .select('element_gagnant_id, element_perdant_id, sexe_votant, age_votant');
    
    const votes = (votesRaw || []) as { element_gagnant_id: string; element_perdant_id: string; sexe_votant: string | null; age_votant: string | null }[];
    
    // Build participation maps from votes
    const partMap: Record<string, {
      total: number;
      homme: number;
      femme: number;
      autre: number;
      '16_18': number;
      '19_22': number;
      '23_26': number;
      '27plus': number;
    }> = {};
    
    const initEntry = () => ({ total: 0, homme: 0, femme: 0, autre: 0, '16_18': 0, '19_22': 0, '23_26': 0, '27plus': 0 });
    
    if (votes.length > 0) {
      for (const v of votes) {
        for (const eid of [v.element_gagnant_id, v.element_perdant_id]) {
          if (!partMap[eid]) partMap[eid] = initEntry();
          partMap[eid].total += 1;
          // Sex segment
          if (v.sexe_votant === 'homme') partMap[eid].homme += 1;
          else if (v.sexe_votant === 'femme') partMap[eid].femme += 1;
          else partMap[eid].autre += 1;
          // Age segment
          const ageKey = (v.age_votant || '').replace(/-/g, '_').replace('+', 'plus') as keyof ReturnType<typeof initEntry>;
          if (ageKey && ageKey in partMap[eid]) {
            partMap[eid][ageKey] += 1;
          }
        }
      }
    }
    
    // Enrich elements with computed participation data
    const enrichedElements = (elements || []).map((e: Record<string, unknown>) => {
      const p = partMap[e.id as string] || initEntry();
      return {
        ...e,
        nb_participations: p.total,
        nb_participations_homme: p.homme,
        nb_participations_femme: p.femme,
        nb_participations_autre: p.autre,
        nb_participations_16_18: p['16_18'],
        nb_participations_19_22: p['19_22'],
        nb_participations_23_26: p['23_26'],
        nb_participations_27plus: p['27plus'],
      };
    });

    return NextResponse.json(
      createApiSuccess({ elements: enrichedElements })
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
    const authError = authenticateAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    
    // Validate with Zod schema
    const validation = elementCreateSchema.safeParse(body);
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
    
    const { texte, categorie, niveau_provocation } = validation.data;

    if (isMockMode) {
      const { mockElements } = await import('@/lib/mockData');
      const newElement: Element = {
        id: `mock_${Date.now()}`,
        texte,
        categorie,
        niveau_provocation,
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
        nb_participations_homme: 0,
        nb_participations_femme: 0,
        nb_participations_autre: 0,
        nb_participations_16_18: 0,
        nb_participations_19_22: 0,
        nb_participations_23_26: 0,
        nb_participations_27plus: 0,
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

    const { data: element, error } = await typedInsert(supabase, 'elements', {
        texte,
        categorie,
        niveau_provocation,
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
      })
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
