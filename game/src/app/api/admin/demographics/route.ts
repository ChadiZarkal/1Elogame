import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getAnalyticsSessions } from '@/lib/repositories';
import { aggregateRealDemographics } from '@/lib/demographics';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const sessions = await getAnalyticsSessions();
  const data = aggregateRealDemographics(sessions);
  return apiSuccess(data);
}, { requireAdmin: true });
