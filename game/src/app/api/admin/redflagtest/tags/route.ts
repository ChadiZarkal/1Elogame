import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess, validateBody } from '@/lib/apiHelpers';
import { ecrireTag } from '@/lib/rft/repository';
import { tagSchema } from '@/lib/rft/schemas';

export const dynamic = 'force-dynamic';

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), tagSchema);
  if (error) return error;

  await ecrireTag(null, data);
  return apiSuccess({ slug: data.slug }, undefined, 201);
}, { requireAdmin: true });
