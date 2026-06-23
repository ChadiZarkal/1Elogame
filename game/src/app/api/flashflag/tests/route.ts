import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { listFlashFlagStandardTests } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const tests = await listFlashFlagStandardTests();
  return apiSuccess({ tests });
});
