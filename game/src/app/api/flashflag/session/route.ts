import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { createFlashFlagSession } from '@/lib/repositories';
import { flashFlagCreateSessionSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, flashFlagCreateSessionSchema);
  if (error) return error;

  const origin = request.nextUrl.origin;

  try {
    const created = await createFlashFlagSession({
      mode: data.mode,
      sourceType: data.sourceType,
      standardTestId: data.standardTestId,
      customTest: data.customTest,
      subjectSex: data.subjectSex,
      subjectAge: data.subjectAge,
      origin,
    });

    return apiSuccess(created, undefined, 201);
  } catch (err) {
    return apiError('FLASHFLAG_CREATE_ERROR', err instanceof Error ? err.message : 'Creation impossible', 400);
  }
});
