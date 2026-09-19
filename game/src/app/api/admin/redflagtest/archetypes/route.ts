import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, validateBody } from '@/lib/apiHelpers';
import { ecrireArchetype } from '@/lib/rft/repository';
import { archetypeSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), archetypeSchema);
  if (error) return error;

  await ecrireArchetype(null, data);
  return apiSuccess({ titre: data.titre }, undefined, 201);
}, { requireAdmin: true });
