import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { updateElement, deleteElement } from '@/lib/repositories';
import { elementUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const PATCH = withApiHandler(async (
  request: NextRequest,
  ctx,
) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const body = await request.json();
  const { data, error } = validateBody(body, elementUpdateSchema);
  if (error) return error;

  const element = await updateElement(id, data);
  if (!element) return apiError('NOT_FOUND', 'Élément non trouvé', 404);
  return apiSuccess({ element });
}, { requireAdmin: true });

export const DELETE = withApiHandler(async (
  request: NextRequest,
  ctx,
) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  await deleteElement(id);
  return apiSuccess({ success: true });
}, { requireAdmin: true });
