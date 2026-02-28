import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getAdminStats, getDailyVoteStats } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const [stats, dailyVotes] = await Promise.all([
    getAdminStats(),
    getDailyVoteStats(),
  ]);
  return apiSuccess({ ...stats, dailyVotes });
}, { requireAdmin: true });
