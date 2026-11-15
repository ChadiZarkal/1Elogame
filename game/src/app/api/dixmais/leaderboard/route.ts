import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getDixMaisLeaderboard } from '@/lib/repositories/dixmais';
import { langueDe } from '@/lib/i18n/langue';
import { traduireEnonces } from '@/lib/dixmais/traduction';
import { chargerSiAnglais } from '@/lib/i18n/traductionsBase';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

  const leaderboard = await getDixMaisLeaderboard(limit);
  // `?lang=en` : la page anglaise. Les énoncés sont réunis par texte français
  // avant d'être traduits : les notes restent communes aux deux langues.
  const langue = langueDe(searchParams.get('lang'));
  await chargerSiAnglais('dixmais', langue);
  return apiSuccess(traduireEnonces(leaderboard, langue));
}, { rateLimit: 'public' });
