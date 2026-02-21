import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getAdminStats } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const stats = await getAdminStats();
  return apiSuccess(stats);
}, { requireAdmin: true });
