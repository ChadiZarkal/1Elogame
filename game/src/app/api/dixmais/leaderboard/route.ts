import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getDixMaisLeaderboard } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

  const leaderboard = await getDixMaisLeaderboard(limit);
  return apiSuccess(leaderboard);
}, { rateLimit: 'public' });
