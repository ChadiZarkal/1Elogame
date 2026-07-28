import { NextRequest } from 'next/server';
import { selectDuelGroup, toElementDTO, AntiRepeatContext } from '@/lib/algorithm';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getActiveElements, getStarredPairs } from '@/lib/repositories';
import { loadAlgorithmConfig } from '@/lib/algorithmConfig';
import { MAX_SEEN_DUELS_STRING_LENGTH } from '@/config/constants';
import { filterAdultContent, isAdultOnlyCategory, isMinorBracket } from '@/lib/contentRating';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const seenDuelsParam = searchParams.get('seenDuels') || '';
  const categoryParam = searchParams.get('category') || null;
  const recentElementsParam = searchParams.get('recentElements') || '';
  const appearancesParam = searchParams.get('appearances') || '';

  // Nombre de propositions du tour. 2 par défaut pour rester compatible avec
  // les appelants historiques ; le jeu en demande 4.
  const requestedCount = Number.parseInt(searchParams.get('count') ?? '2', 10);
  const count = Math.min(Math.max(Number.isFinite(requestedCount) ? requestedCount : 2, 2), 4);

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

  // Le contenu « Amour & Sexe » n'est pas servi aux mineurs.
  const restrictAdultContent = isMinorBracket(searchParams.get('age'));
  if (restrictAdultContent && isAdultOnlyCategory(categoryParam)) {
    return apiError('FORBIDDEN_CATEGORY', 'Cette catégorie est réservée aux majeurs', 403);
  }

  // Load persisted algorithm config (Supabase in prod, cached in memory)
  const algorithmConfig = await loadAlgorithmConfig();

  // Fetch data via repository (mock/prod abstracted away)
  const [allElements, starredPairs] = await Promise.all([
    getActiveElements(categoryParam),
    getStarredPairs(),
  ]);

  const elements = filterAdultContent(allElements, restrictAdultContent);

  if (elements.length < 2) {
    return apiError('INSUFFICIENT_ELEMENTS', 'Pas assez d\'éléments actifs pour créer un duel', 400);
  }

  const group = selectDuelGroup(elements, seenDuels, count, antiRepeatContext, starredPairs, algorithmConfig);

  if (!group) {
    return apiSuccess({ elements: [], elementA: null, elementB: null, allExhausted: true });
  }

  const dtos = group.map(toElementDTO);

  // `elementA` / `elementB` restent servis pour les appelants qui attendent
  // encore la forme à deux éléments.
  return apiSuccess({
    elements: dtos,
    elementA: dtos[0] ?? null,
    elementB: dtos[1] ?? null,
    allExhausted: false,
  });
}, { rateLimit: true });
