import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { updateDixMaisStatement, deleteDixMaisStatement } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  text: z.string().min(3).max(300).optional(),
  type: z.enum(['positive', 'negative']).optional(),
  category: z.string().min(1).max(50).optional(),
  is_active: z.boolean().optional(),
  is_approved: z.boolean().optional(),
});

export const PATCH = withApiHandler(async (req: NextRequest, ctx) => {
  const id = (ctx?.params as { id?: string })?.id;
  if (!id) return apiError('BAD_REQUEST', 'ID manquant', 400);

  const body = await req.json();
  const { data, error } = validateBody(body, patchSchema);
  if (error) return error;

  const updated = await updateDixMaisStatement(id, data);
  return apiSuccess(updated);
}, { requireAdmin: true });

export const DELETE = withApiHandler(async (_req: NextRequest, ctx) => {
  const id = (ctx?.params as { id?: string })?.id;
  if (!id) return apiError('BAD_REQUEST', 'ID manquant', 400);

  await deleteDixMaisStatement(id);
  return apiSuccess({ deleted: true });
}, { requireAdmin: true });
