import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getGenderStats } from '@/lib/repositories/community';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const stats = await getGenderStats();
  return apiSuccess(stats);
});
