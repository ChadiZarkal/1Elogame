import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { lireStatsPubliques } from '@/lib/rft/repository';

export const dynamic = 'force-dynamic';

/**
 * Les statistiques publiques : qui a répondu quoi, et comment ça se répartit
 * entre les hommes et les femmes.
 *
 * Route publique, donc `lireStatsPubliques` ne transporte AUCUN point. Y faire
 * figurer le barème le rendrait consultable par tout le monde, et le test
 * truquable en une requête.
 */
export const GET = withApiHandler(async () => {
  return apiSuccess({ questions: await lireStatsPubliques() });
}, { rateLimit: 'public' });
