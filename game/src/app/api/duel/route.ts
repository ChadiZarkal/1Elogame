import { NextRequest, NextResponse } from 'next/server';
import { selectDuelPair, toElementDTO, AntiRepeatContext } from '@/lib/algorithm';
import { createApiSuccess, createApiError } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rateLimit';
import { Element } from '@/types/database';

export const dynamic = 'force-dynamic';

// Check if we're in mock mode
const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 60 requests per minute
    const rateLimited = checkRateLimit(request, 'public');
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const seenDuelsParam = searchParams.get('seenDuels') || '';
    const categoryParam = searchParams.get('category') || null;
    const recentElementsParam = searchParams.get('recentElements') || '';
    const appearancesParam = searchParams.get('appearances') || '';
    
    // Guard against oversized params (max 10KB each)
    if (seenDuelsParam.length > 10_000 || recentElementsParam.length > 5_000 || appearancesParam.length > 5_000) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Paramètres trop longs'),
        { status: 400 }
      );
    }
    
    // Parse seen duels into a Set
    const seenDuels = new Set<string>(
      seenDuelsParam ? seenDuelsParam.split(',').filter(Boolean) : []
    );
    
    // Parse anti-repeat context
    const antiRepeatContext: AntiRepeatContext = {
      recentElementIds: recentElementsParam ? recentElementsParam.split(',').filter(Boolean) : [],
      elementAppearances: {},
    };
    
    // Parse appearances: "id1:count1,id2:count2,..."
    if (appearancesParam) {
      for (const entry of appearancesParam.split(',').filter(Boolean)) {
        const [id, countStr] = entry.split(':');
        if (id && countStr) {
          antiRepeatContext.elementAppearances[id] = parseInt(countStr, 10) || 0;
        }
      }
    }
    
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
      // Use Supabase — parallelize independent queries
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
      
      // Parallelize: elements + starred pairs
      const [elementsResult, starredResult] = await Promise.all([
        query,
        supabase
          .from('duel_feedback')
          .select('element_a_id, element_b_id, stars_count')
          .gte('stars_count', 50)
          .order('stars_count', { ascending: false })
          .limit(100),
      ]);
      
      if (elementsResult.error) {
        console.error('Error fetching elements:', elementsResult.error);
        return NextResponse.json(
          createApiError('DATABASE_ERROR', 'Erreur lors de la récupération des éléments'),
          { status: 500 }
        );
      }
      
      elements = (elementsResult.data as Element[]) || [];
      starredPairs = starredResult.data || undefined;
    }
    
    if (!elements || elements.length < 2) {
      return NextResponse.json(
        createApiError('INSUFFICIENT_ELEMENTS', 'Pas assez d\'éléments actifs pour créer un duel'),
        { status: 400 }
      );
    }
    
    // Select duel pair using the algorithm with anti-repeat
    const pair = selectDuelPair(elements, seenDuels, antiRepeatContext, starredPairs);
    
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
