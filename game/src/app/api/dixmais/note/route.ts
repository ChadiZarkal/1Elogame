import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import { recordDixMaisNote } from '@/lib/repositories/dixmais';
import { NOTE_MAX, NOTE_MIN } from '@/lib/dixmaisNote';

export const dynamic = 'force-dynamic';

/**
 * Une note de la mécanique actuelle : une info, notée seule, de 0 à 15.
 *
 * Distincte de `/api/dixmais/vote`, qui enregistre les votes de l'ancienne
 * mécanique (une note cumulée bornée à 10) dans une autre table : les deux
 * mesures ne se mélangent pas. Voir la migration 030.
 */
const noteSchema = z.object({
  // Un UUID en production ; le mode simulé sert des identifiants `mock-3`.
  statement_id: z.string().min(1).max(64),
  session_id: z.string().min(1).max(64),
  note: z.number().int().min(NOTE_MIN).max(NOTE_MAX),
  // Facultatifs : un joueur sans profil compte dans la moyenne générale,
  // simplement pas dans une cohorte.
  sex: z.enum(['homme', 'femme', 'autre']).nullable().optional(),
  age: z.enum(['16-18', '19-22', '23-26', '27+']).nullable().optional(),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { data, error } = validateBody(body, noteSchema);
  if (error) return error;

  const recorded = await recordDixMaisNote(data);
  return apiSuccess({ recorded });
}, { rateLimit: 'public' });
