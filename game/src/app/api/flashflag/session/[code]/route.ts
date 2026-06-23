import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getFlashFlagSessionByCode } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (
  _request: NextRequest,
  ctx,
) => {
  const { code } = await (ctx as { params: Promise<{ code: string }> }).params;

  const data = await getFlashFlagSessionByCode(code);
  if (!data) return apiError('NOT_FOUND', 'Session introuvable', 404);

  return apiSuccess({
    status: data.session.status,
    mode: data.session.mode,
    sourceType: data.session.source_type,
    subject: {
      sex: data.session.subject_sex,
      age: data.session.subject_age,
    },
    score: {
      total: data.session.total_score,
      max: data.session.max_score,
      answered: data.session.answered_count,
      timedOut: data.session.timed_out_count,
    },
    test: data.test,
    answers: data.answers,
  });
});
