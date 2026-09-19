import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, validateBody } from '@/lib/apiHelpers';
import { ecrireQuestion, reordonnerQuestions } from '@/lib/rft/repository';
import { ordreSchema, questionSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), questionSchema);
  if (error) return error;

  const id = await ecrireQuestion(null, data);
  return apiSuccess({ id }, undefined, 201);
}, { requireAdmin: true });

/** Réordonnancement : la liste complète des identifiants, dans le nouvel ordre. */
export const PUT = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), ordreSchema);
  if (error) return error;

  await reordonnerQuestions(data.ids);
  return apiSuccess({ ordonnees: data.ids.length });
}, { requireAdmin: true });
