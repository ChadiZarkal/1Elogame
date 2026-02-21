import { NextRequest } from 'next/server';
import { voteSchema } from '@/lib/validations';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { processVote } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, voteSchema);
  if (error) return error;

  const { winnerId, loserId, sexe, age } = data;

  try {
    const result = await processVote(winnerId, loserId, sexe, age);
    return apiSuccess(result);
  } catch (e) {
    if ((e as Error).message === 'NOT_FOUND') {
      return apiError('NOT_FOUND', 'Éléments non trouvés', 404);
    }
    throw e;
  }
}, { rateLimit: true });
