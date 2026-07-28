import { NextRequest } from 'next/server';
import { voteSchema } from '@/lib/validations';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { processMultiVote } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, voteSchema);
  if (error) return error;

  const { winnerId, loserId, loserIds, sexe, age } = data;

  // Les N-1 duels d'un tour à choix multiple tiennent dans une seule requête :
  // les émettre séparément consommerait trois fois le quota et ferait courir
  // les écritures Elo les unes contre les autres.
  const losers = loserIds?.length ? loserIds : loserId ? [loserId] : [];

  try {
    const result = await processMultiVote(winnerId, losers, sexe, age);
    return apiSuccess(result);
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return apiError('NOT_FOUND', 'Éléments non trouvés', 404);
    }
    throw e;
  }
}, { rateLimit: true });
