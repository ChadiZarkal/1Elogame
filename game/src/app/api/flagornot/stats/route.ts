import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getGenderStats } from '@/lib/repositories/community';
import { langueDe } from '@/lib/i18n/langue';
import { insightsAnglais } from '@/lib/oracle/insights';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (request: NextRequest) => {
  const stats = await getGenderStats();
  // `?lang=en` : la page anglaise. Les constats sont rédigés en anglais à
  // partir des mêmes chiffres ; la réponse française ne change pas.
  if (langueDe(request.nextUrl.searchParams.get('lang')) === 'en') {
    return apiSuccess({ ...stats, insights: insightsAnglais(stats.byGender) });
  }
  return apiSuccess(stats);
});
