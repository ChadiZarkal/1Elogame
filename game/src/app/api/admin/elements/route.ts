import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { getAllElementsEnriched, createElement } from '@/lib/repositories';
import { elementCreateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const elements = await getAllElementsEnriched();
  return apiSuccess({ elements });
}, { requireAdmin: true });

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, elementCreateSchema);
  if (error) return error;

  const element = await createElement(data);
  return apiSuccess({ element }, undefined, 201);
}, { requireAdmin: true });
