import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError } from '@/lib/apiHelpers';
import { lireResultatParCode } from '@/lib/rft/repository';

export const dynamic = 'force-dynamic';

/**
 * Le résultat d'une partie partagée.
 *
 * Recalculé à chaque lecture plutôt que relu d'un cliché : les classements et
 * les parts de réponses suivent la population d'aujourd'hui. Seul le score est
 * celui du jour de la partie — un barème modifié depuis ne doit pas réécrire
 * après coup le résultat de quelqu'un.
 */
export const GET = withApiHandler(async (_req: NextRequest, ctx) => {
  const params = await (ctx as { params?: Promise<{ code?: string }> } | undefined)?.params;
  const code = params?.code;
  if (!code) return apiError('BAD_REQUEST', 'Code manquant', 400);

  const resultat = await lireResultatParCode(code);
  if (!resultat) return apiError('NOT_FOUND', 'Ce résultat n’existe pas ou plus.', 404);

  return apiSuccess(resultat);
}, { rateLimit: 'public' });
