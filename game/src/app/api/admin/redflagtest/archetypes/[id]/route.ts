import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError, validateBody } from '@/lib/apiHelpers';
import { ecrireArchetype, supprimerArchetype } from '@/lib/rft/repository';
import { lireIdRft } from '@/lib/rft/params';
import { archetypeSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const PUT = withApiHandler(async (req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant d’archétype manquant', 400);

  const { data, error } = validateBody(await req.json(), archetypeSchema);
  if (error) return error;

  await ecrireArchetype(id, data);
  return apiSuccess({ id });
}, { requireAdmin: true });

export const DELETE = withApiHandler(async (_req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant d’archétype manquant', 400);

  await supprimerArchetype(id);
  return apiSuccess({ id });
}, { requireAdmin: true });
