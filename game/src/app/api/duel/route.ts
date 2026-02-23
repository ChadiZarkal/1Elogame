import { NextRequest } from 'next/server';
import { selectDuelPair, toElementDTO, AntiRepeatContext } from '@/lib/algorithm';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getActiveElements, getStarredPairs } from '@/lib/repositories';
import { loadAlgorithmConfig } from '@/lib/algorithmConfig';
import { MAX_SEEN_DUELS_STRING_LENGTH } from '@/config/constants';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const seenDuelsParam = searchParams.get('seenDuels') || '';
  const categoryParam = searchParams.get('category') || null;
  const recentElementsParam = searchParams.get('recentElements') || '';
  const appearancesParam = searchParams.get('appearances') || '';

  // Guard against oversized params
  if (seenDuelsParam.length > MAX_SEEN_DUELS_STRING_LENGTH || recentElementsParam.length > 5_000 || appearancesParam.length > 5_000) {
    return apiError('VALIDATION_ERROR', 'Paramètres trop longs', 400);
  }

  const seenDuels = new Set<string>(seenDuelsParam ? seenDuelsParam.split(',').filter(Boolean) : []);

  const antiRepeatContext: AntiRepeatContext = {
    recentElementIds: recentElementsParam ? recentElementsParam.split(',').filter(Boolean) : [],
    elementAppearances: {},
  };

  if (appearancesParam) {
    for (const entry of appearancesParam.split(',').filter(Boolean)) {
      const [id, countStr] = entry.split(':');
      if (id && countStr) antiRepeatContext.elementAppearances[id] = parseInt(countStr, 10) || 0;
    }
  }

  // Load persisted algorithm config (Supabase in prod, cached in memory)
  const algorithmConfig = await loadAlgorithmConfig();

  // Fetch data via repository (mock/prod abstracted away)
  const [elements, starredPairs] = await Promise.all([
    getActiveElements(categoryParam),
    getStarredPairs(),
  ]);

  if (elements.length < 2) {
    return apiError('INSUFFICIENT_ELEMENTS', 'Pas assez d\'éléments actifs pour créer un duel', 400);
  }

  const pair = selectDuelPair(elements, seenDuels, antiRepeatContext, starredPairs, algorithmConfig);

  if (!pair) {
    return apiSuccess({ elementA: null, elementB: null, allExhausted: true });
  }

  const [elementA, elementB] = pair;
  return apiSuccess({ elementA: toElementDTO(elementA), elementB: toElementDTO(elementB), allExhausted: false });
}, { rateLimit: true });
