import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getPublicStats } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const stats = await getPublicStats();
  return apiSuccess(stats);
});
