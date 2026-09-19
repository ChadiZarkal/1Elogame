import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, validateBody } from '@/lib/apiHelpers';
import { ecrireVerdict } from '@/lib/rft/repository';
import { verdictSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), verdictSchema);
  if (error) return error;

  await ecrireVerdict(null, data);
  return apiSuccess({ minScore: data.minScore }, undefined, 201);
}, { requireAdmin: true });
