import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getRandomStatements } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const count = Math.min(Math.max(parseInt(searchParams.get('count') ?? '7', 10), 3), 12);

  const statements = await getRandomStatements(count);
  return apiSuccess(statements);
}, { rateLimit: 'public' });
