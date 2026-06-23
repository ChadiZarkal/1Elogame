import { NextRequest } from 'next/server';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { listAdminFlashFlagTests, createAdminFlashFlagTest } from '@/lib/repositories';
import { flashFlagAdminTestSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export const GET = withApiHandler(async () => {
  const tests = await listAdminFlashFlagTests();
  return apiSuccess({ tests });
}, { requireAdmin: true });

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateBody(body, flashFlagAdminTestSchema);
  if (error) return error;

  const created = await createAdminFlashFlagTest({
    name: data.name,
    description: data.description,
    isActive: data.isActive,
    questions: data.questions,
  });

  return apiSuccess({ testId: created.id }, undefined, 201);
}, { requireAdmin: true });
