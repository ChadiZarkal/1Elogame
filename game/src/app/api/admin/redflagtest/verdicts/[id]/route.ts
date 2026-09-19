import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, apiError, validateBody } from '@/lib/apiHelpers';
import { ecrireVerdict, supprimerVerdict } from '@/lib/rft/repository';
import { lireIdRft } from '@/lib/rft/params';
import { verdictSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const PUT = withApiHandler(async (req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de verdict manquant', 400);

  const { data, error } = validateBody(await req.json(), verdictSchema);
  if (error) return error;

  await ecrireVerdict(id, data);
  return apiSuccess({ id });
}, { requireAdmin: true });

export const DELETE = withApiHandler(async (_req: NextRequest, ctx) => {
  const id = await lireIdRft(ctx);
  if (!id) return apiError('BAD_REQUEST', 'Identifiant de verdict manquant', 400);

  await supprimerVerdict(id);
  return apiSuccess({ id });
}, { requireAdmin: true });
