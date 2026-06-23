import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { startFlashFlagSession } from '@/lib/repositories';
import { flashFlagStartSessionSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (
  request: NextRequest,
  ctx,
) => {
  const { code } = await (ctx as { params: Promise<{ code: string }> }).params;

  const body = await request.json().catch(() => ({ started: true }));
  const { error } = validateBody(body, flashFlagStartSessionSchema);
  if (error) return error;

  try {
    await startFlashFlagSession(code);
    return apiSuccess({ started: true });
  } catch (err) {
    return apiError('FLASHFLAG_START_ERROR', err instanceof Error ? err.message : 'Demarrage impossible', 400);
  }
});
