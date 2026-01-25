import { NextRequest, NextResponse } from 'next/server';
import { selectDuelPair, toElementDTO } from '@/lib/algorithm';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { Element } from '@/types/database';

export const dynamic = 'force-dynamic';

// Check if we're in mock mode
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seenDuelsParam = searchParams.get('seenDuels') || '';
    const categoryParam = searchParams.get('category') || null; // Nouveau: filtre par catégorie
    
    // Parse seen duels into a Set
    const seenDuels = new Set<string>(
      seenDuelsParam ? seenDuelsParam.split(',').filter(Boolean) : []
    );
    
    let elements: Element[];
    let starredPairs: { element_a_id: string; element_b_id: string; stars_count: number }[] | undefined;
    
    if (isMockMode) {
      // Use mock data
      const { getMockElements } = await import('@/lib/mockData');
      let mockElements = getMockElements();
      
      // Filtrer par catégorie si spécifié
      if (categoryParam) {
        mockElements = mockElements.filter(e => e.categorie === categoryParam);
      }
      
      elements = mockElements;
      starredPairs = undefined;
    } else {
      // Use Supabase
      const { createServerClient } = await import('@/lib/supabase');
      const supabase = createServerClient();
      
      // Construire la requête de base
      let query = supabase
        .from('elements')
        .select('*')
        .eq('actif', true);
      
      // Filtrer par catégorie si spécifié (mode thématique)
      if (categoryParam) {
        query = query.eq('categorie', categoryParam);
      }
      
      const { data: elementsData, error: elementsError } = await query;
      
      if (elementsError) {
        console.error('Error fetching elements:', elementsError);
        return NextResponse.json(
          createApiError('DATABASE_ERROR', 'Erreur lors de la récupération des éléments'),
          { status: 500 }
        );
      }
      
      elements = (elementsData as Element[]) || [];
      
      // Fetch starred pairs (optional, for starred strategy)
      const { data: starredData } = await supabase
        .from('duel_feedback')
        .select('element_a_id, element_b_id, stars_count')
        .gte('stars_count', 50)
        .order('stars_count', { ascending: false })
        .limit(100);
      
      starredPairs = starredData || undefined;
    }
    
    if (!elements || elements.length < 2) {
      return NextResponse.json(
        createApiError('INSUFFICIENT_ELEMENTS', 'Pas assez d\'éléments actifs pour créer un duel'),
        { status: 400 }
      );
    }
    
    // Select duel pair using the algorithm
    const pair = selectDuelPair(elements, seenDuels, starredPairs);
    
    if (!pair) {
      return NextResponse.json(
        createApiSuccess({
          elementA: null,
          elementB: null,
          allExhausted: true,
        })
      );
    }
    
    const [elementA, elementB] = pair;
    
    return NextResponse.json(
      createApiSuccess({
        elementA: toElementDTO(elementA),
        elementB: toElementDTO(elementB),
        allExhausted: false,
      })
    );
  } catch (error) {
    console.error('Error in GET /api/duel:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Une erreur interne est survenue'),
      { status: 500 }
    );
  }
}
