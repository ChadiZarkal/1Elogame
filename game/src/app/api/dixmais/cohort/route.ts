import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { getDixMaisCohortStats } from '@/lib/repositories/dixmais';

export const dynamic = 'force-dynamic';

/**
 * Les identifiants passent par le corps de la requête et non par l'URL : une
 * session de dix profils en compte jusqu'à cinquante, soit près de deux mille
 * caractères de paramètres.
 */
const cohortSchema = z.object({
  // Bornés en longueur plutôt que validés comme UUID : le mode simulé sert des
  // identifiants de la forme `mock-3`, et exiger un UUID rendrait la
  // comparaison invérifiable en développement.
  statement_ids: z.array(z.string().min(1).max(64)).min(1).max(80),
  sex: z.enum(['homme', 'femme', 'autre']),
  age: z.enum(['16-18', '19-22', '23-26', '27+']),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { data, error } = validateBody(body, cohortSchema);
  if (error) return error;

  const stats = await getDixMaisCohortStats(data.statement_ids, data.sex, data.age);
  return apiSuccess(stats);
}, { rateLimit: 'public' });
