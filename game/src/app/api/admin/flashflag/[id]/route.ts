import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { getAdminFlashFlagTestById, updateAdminFlashFlagTest, disableAdminFlashFlagTest } from '@/lib/repositories';
import { flashFlagAdminUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async (
  _request: NextRequest,
  ctx,
) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const test = await getAdminFlashFlagTestById(id);
  if (!test) return apiError('NOT_FOUND', 'Test introuvable', 404);
  return apiSuccess({ test });
}, { requireAdmin: true });

export const PATCH = withApiHandler(async (
  request: NextRequest,
  ctx,
) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const body = await request.json();
  const { data, error } = validateBody(body, flashFlagAdminUpdateSchema);
  if (error) return error;

  const ok = await updateAdminFlashFlagTest(id, {
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    questions: data.questions,
  });

  if (!ok) return apiError('NOT_FOUND', 'Test introuvable', 404);
  return apiSuccess({ updated: true });
}, { requireAdmin: true });

export const DELETE = withApiHandler(async (
  _request: NextRequest,
  ctx,
) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const ok = await disableAdminFlashFlagTest(id);
  if (!ok) return apiError('NOT_FOUND', 'Test introuvable', 404);
  return apiSuccess({ deleted: true });
}, { requireAdmin: true });
