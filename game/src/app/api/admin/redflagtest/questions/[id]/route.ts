import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError, validateBody } from '@/lib/apiHelpers';
import { ecrireQuestion, supprimerQuestion } from '@/lib/rft/repository';
import { lireIdRft } from '@/lib/rft/params';
import { questionSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const PUT = withApiHandler(async (req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de question manquant', 400);

  const { data, error } = validateBody(await req.json(), questionSchema);
  if (error) return error;

  await ecrireQuestion(id, data);
  return apiSuccess({ id });
}, { requireAdmin: true });

/**
 * Supprimer une question emporte ses réponses ET les parties qui les citaient,
 * par la cascade. C'est délibéré : garder des réponses orphelines gonflerait le
 * dénominateur des pourcentages avec des choix devenus impossibles.
 *
 * C'est aussi pourquoi l'administration propose de désactiver plutôt que de
 * supprimer une fois le test en ligne.
 */
export const DELETE = withApiHandler(async (_req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de question manquant', 400);

  await supprimerQuestion(id);
  return apiSuccess({ id });
}, { requireAdmin: true });
