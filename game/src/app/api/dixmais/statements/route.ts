import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getRandomStatements } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const count = Math.min(Math.max(parseInt(searchParams.get('count') ?? '7', 10), 3), 12);
  const excludeIds = (searchParams.get('exclude') ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  // `types=negative` : que des red flags (mécanique de la moyenne).
  const redFlagsSeulement = searchParams.get('types') === 'negative';

  const statements = await getRandomStatements(count, excludeIds, redFlagsSeulement);
  return apiSuccess(statements);
}, { rateLimit: 'public' });
