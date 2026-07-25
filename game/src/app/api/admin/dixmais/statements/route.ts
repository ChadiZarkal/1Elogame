import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { getAllDixMaisStatements, createDixMaisStatement } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  text: z.string().min(3).max(300),
  type: z.enum(['positive', 'negative']),
  category: z.string().min(1).max(50).default('general'),
});

export const GET = withApiHandler(async () => {
  const statements = await getAllDixMaisStatements();
  return apiSuccess(statements);
}, { requireAdmin: true });

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { data, error } = validateBody(body, createSchema);
  if (error) return error;

  const statement = await createDixMaisStatement(data);
  return apiSuccess(statement, undefined, 201);
}, { requireAdmin: true });
