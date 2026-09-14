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
  // Facultatifs : le jeu ne réclame le profil qu'au moment du rapport, et un
  // joueur qui refuse continue de jouer — son vote compte, simplement pas dans
  // une cohorte. `nullable` autant qu'`optional` : le client envoie `null`
  // plutôt que d'omettre la clé quand il a demandé sans obtenir de réponse.
  sex: z.enum(['homme', 'femme', 'autre']).nullable().optional(),
  age: z.enum(['16-18', '19-22', '23-26', '27+']).nullable().optional(),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { data, error } = validateBody(body, voteSchema);
  if (error) return error;

  await recordDixMaisVote(data);
  return apiSuccess({ recorded: true });
}, { rateLimit: 'public' });
