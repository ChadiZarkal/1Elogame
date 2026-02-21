import { NextRequest } from 'next/server';
import { feedbackSchema } from '@/lib/validations';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { upsertFeedback } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, feedbackSchema);
  if (error) return error;

  await upsertFeedback(data.elementAId, data.elementBId, data.type);
  return apiSuccess({ success: true });
}, { rateLimit: true });
