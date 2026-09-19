import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError, validateBody } from '@/lib/apiHelpers';
import { ecrireTag, supprimerTag } from '@/lib/rft/repository';
import { lireIdRft } from '@/lib/rft/params';
import { tagSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const PUT = withApiHandler(async (req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de tag manquant', 400);

  const { data, error } = validateBody(await req.json(), tagSchema);
  if (error) return error;

  await ecrireTag(id, data);
  return apiSuccess({ id });
}, { requireAdmin: true });

/**
 * Supprimer un tag détache les questions qui le portaient — la cascade s'en
 * charge — mais ne les supprime pas. Un axe disparaît du radar, les questions
 * restent et comptent toujours dans le score.
 */
export const DELETE = withApiHandler(async (_req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de tag manquant', 400);

  await supprimerTag(id);
  return apiSuccess({ id });
}, { requireAdmin: true });
