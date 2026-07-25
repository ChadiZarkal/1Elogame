import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess, apiError } from '@/lib/apiHelpers';
import { recordDixMaisVote } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

const voteSchema = z.object({
  statement_id: z.string().uuid(),
  session_id: z.string().min(1).max(64),
  previous_score: z.number().int().min(0).max(10),
  new_score: z.number().int().min(0).max(10),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { data, error } = validateBody(body, voteSchema);
  if (error) return error;

  await recordDixMaisVote(data);
  return apiSuccess({ recorded: true });
}, { rateLimit: 'public' });
