import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { submitFlashFlagAnswers } from '@/lib/repositories';
import { flashFlagSubmitSchema } from '@/lib/validations';
import { getRiskLabel } from '@/lib/flashflag';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (
  request: NextRequest,
  ctx,
) => {
  const { code } = await (ctx as { params: Promise<{ code: string }> }).params;

  const body = await request.json();
  const { data, error } = validateBody(body, flashFlagSubmitSchema);
  if (error) return error;

  try {
    const summary = await submitFlashFlagAnswers(code, data.answers);
    return apiSuccess({
      ...summary,
      riskLabel: getRiskLabel(summary.level),
    });
  } catch (err) {
    return apiError('FLASHFLAG_SUBMIT_ERROR', err instanceof Error ? err.message : 'Soumission impossible', 400);
  }
});
