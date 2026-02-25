import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getGlobalVerdictCounts } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const counts = await getGlobalVerdictCounts();
  return apiSuccess(counts);
});
