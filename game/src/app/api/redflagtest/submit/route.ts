import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, apiSuccess, validateBody } from '@/lib/apiHelpers';
import { enregistrerPartie } from '@/lib/rft/repository';

export const dynamic = 'force-dynamic';

/**
 * Ce que le client a le droit d'envoyer : des identifiants, un profil, une
 * durée. Aucun point, aucun score.
 *
 * Le schéma le dit mieux qu'un commentaire : il n'y a littéralement pas de
 * champ où glisser un score. Un navigateur qui voudrait tricher devrait
 * deviner quelles réponses valent cher, et c'est précisément ce que
 * l'expédition sans barème l'empêche de faire.
 */
const schema = z.object({
  choix: z
    .array(z.object({ questionId: z.string().min(1), answerId: z.string().min(1) }))
    .max(200),
  sexe: z.enum(['homme', 'femme', 'autre']).nullable().default(null),
  age: z.enum(['16-18', '19-22', '23-26', '27+']).nullable().default(null),
  dureeMs: z.number().int().positive().max(86_400_000).nullable().default(null),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), schema);
  if (error) return error;

  return apiSuccess(await enregistrerPartie(data));
}, { rateLimit: 'public' });
