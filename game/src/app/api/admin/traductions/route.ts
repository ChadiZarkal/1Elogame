/**
 * La zone « Traduction » des panneaux d'administration (2026-11-15).
 *
 * POST : l'état de traduction d'une liste de textes français, tels que le
 *        panneau les a à l'écran — traduction saisie dans l'admin, sinon celle
 *        du dictionnaire du code, sinon rien.
 * PUT  : enregistre l'anglais d'un texte (vide : retire la saisie, et le
 *        dictionnaire du code, s'il en a une, reprend la main).
 *
 * Voir `lib/i18n/traductionsBase`.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, validateBody, apiSuccess } from '@/lib/apiHelpers';
import {
  cleTraduction,
  enregistrerTraduction,
  listerTraductions,
  tableAbsente,
  type EtatTraduction,
  type SourceTraduction,
} from '@/lib/i18n/traductionsBase';
import { traductionDuCode as duCodeJeu } from '@/lib/jeu/traduction';
import { traductionDuCode as duCodeRft } from '@/lib/rft/traduction';
import { traductionDuCode as duCodeDixmais } from '@/lib/dixmais/traduction';

export const dynamic = 'force-dynamic';

const DU_CODE: Record<SourceTraduction, (texte: string) => string | undefined> = {
  jeu: duCodeJeu,
  rft: duCodeRft,
  dixmais: duCodeDixmais,
};

const source = z.enum(['jeu', 'rft', 'dixmais']);

const etatSchema = z.object({
  source,
  textes: z.array(z.string().max(2000)).max(5000),
});

const enregistrementSchema = z.object({
  source,
  texteFr: z.string().min(1).max(2000),
  texteEn: z.string().max(2000),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), etatSchema);
  if (error) return error;

  const saisies = new Map((await listerTraductions(data.source)).map((l) => [l.cle, l.texteEn]));
  const vus = new Set<string>();
  const etats: EtatTraduction[] = [];
  for (const fr of data.textes) {
    const cle = cleTraduction(fr);
    if (!cle || vus.has(cle)) continue;
    vus.add(cle);
    const code = DU_CODE[data.source](fr) ?? null;
    const saisie = saisies.get(cle);
    etats.push({ fr, en: saisie ?? code, origine: saisie ? 'admin' : code ? 'code' : null, code });
  }
  return apiSuccess({ etats, tableAbsente: tableAbsente(data.source) });
}, { requireAdmin: true });

export const PUT = withApiHandler(async (req: NextRequest) => {
  const { data, error } = validateBody(await req.json(), enregistrementSchema);
  if (error) return error;
  await enregistrerTraduction(data.source, data.texteFr, data.texteEn);
  return apiSuccess({ ok: true });
}, { requireAdmin: true });
