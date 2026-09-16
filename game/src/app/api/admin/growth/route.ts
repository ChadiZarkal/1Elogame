import { NextRequest } from 'next/server';
import { withApiHandler, apiSuccess } from '@/lib/apiHelpers';
import { getDailyGrowth, DEFAULT_WINDOW_DAYS } from '@/lib/repositories/growth';

export const dynamic = 'force-dynamic';

/** Fenêtre bornée : au-delà d'un an la courbe n'est plus lisible, en deçà de
 * trente jours la moyenne glissante n'a pas de quoi se former. */
export const GET = withApiHandler(async (req: NextRequest) => {
  const demande = Number(new URL(req.url).searchParams.get('jours') ?? DEFAULT_WINDOW_DAYS);
  const jours = Math.min(Math.max(Number.isFinite(demande) ? demande : DEFAULT_WINDOW_DAYS, 30), 365);

  const points = await getDailyGrowth(jours);
  return apiSuccess({ jours, points });
}, { requireAdmin: true });
