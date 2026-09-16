/**
 * @module repositories/growth
 * Série d'activité quotidienne, pour le tableau de bord d'administration.
 *
 * Les deux bases sont interrogées en parallèle : les jeux historiques sur le
 * projet principal, « C'est un 10 mais… » sur le sien. Chacune répond par une
 * ligne par jour, calendrier complet et jours creux à zéro — le comptage se
 * fait en SQL parce que PostgREST ne sait pas grouper, et qu'il tronque à mille
 * lignes ce qu'on essaierait de compter côté Node.
 */

import { isMockMode } from '@/lib/apiHelpers';
import type { DailyPoint } from '@/lib/growth';

/** Un peu plus de six mois : de quoi voir une tendance sans noyer la courbe. */
export const DEFAULT_WINDOW_DAYS = 180;

interface LigneCroissance {
  jour: string;
  votes: number;
  oracle: number;
  sessions: number;
}

interface LigneDixmais {
  jour: string;
  votes: number;
}

/**
 * Série simulée, en mode développement : une tendance montante bruitée par un
 * cycle hebdomadaire, pour que le lissage et les variations aient quelque chose
 * à mordre.
 */
function buildMockSeries(jours: number): DailyPoint[] {
  const out: DailyPoint[] = [];
  const aujourdhui = new Date();

  for (let i = jours - 1; i >= 0; i--) {
    const d = new Date(aujourdhui);
    d.setDate(d.getDate() - i);
    const rang = jours - i;
    // Le week-end pèse plus lourd : c'est un jeu de soirée.
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.6 : 1;
    const tendance = 8 + rang * 0.25;
    const bruit = ((rang * 37) % 11) - 5;

    out.push({
      jour: d.toISOString().slice(0, 10),
      votes: Math.max(0, Math.round(tendance * weekend * 4 + bruit)),
      oracle: Math.max(0, Math.round(tendance * weekend * 0.3 + (bruit % 3))),
      sessions: Math.max(0, Math.round(tendance * weekend * 3 + bruit)),
      dixmais: Math.max(0, Math.round(Math.max(0, rang - jours * 0.6) * weekend * 2)),
    });
  }
  return out;
}

export async function getDailyGrowth(jours = DEFAULT_WINDOW_DAYS): Promise<DailyPoint[]> {
  if (isMockMode()) return buildMockSeries(jours);

  const [principal, dixmais] = await Promise.all([
    lireSeriePrincipale(jours),
    lireSerieDixmais(jours),
  ]);

  // La série principale porte le calendrier : elle vient de la base qui a le
  // plus d'historique, et c'est elle qui fixe les jours affichés.
  const parJour = new Map(dixmais.map((l) => [l.jour, l.votes]));
  return principal.map((l) => ({
    jour: l.jour,
    votes: l.votes,
    oracle: l.oracle,
    sessions: l.sessions,
    dixmais: parJour.get(l.jour) ?? 0,
  }));
}

async function lireSeriePrincipale(jours: number): Promise<LigneCroissance[]> {
  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await (supabase as never as {
    rpc: (n: string, p: Record<string, unknown>) => Promise<{ data: LigneCroissance[] | null; error: { message: string } | null }>;
  }).rpc('croissance_quotidienne', { p_jours: jours });

  if (error) throw new Error(`Croissance indisponible : ${error.message}`);
  return data ?? [];
}

/**
 * La courbe de « C'est un 10 mais… » est facultative : sa base est un autre
 * projet Supabase, dont la fonction peut ne pas encore être en place. Une
 * absence vaut zéro — le reste du tableau de bord tient debout sans elle.
 */
async function lireSerieDixmais(jours: number): Promise<LigneDixmais[]> {
  try {
    const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
    const supabase = createDixmaisServerClient();

    const { data, error } = await (supabase as never as {
      rpc: (n: string, p: Record<string, unknown>) => Promise<{ data: LigneDixmais[] | null; error: { message: string } | null }>;
    }).rpc('dixmais_croissance_quotidienne', { p_jours: jours });

    if (error) {
      console.warn('[CROISSANCE] Série dixmais indisponible :', error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn('[CROISSANCE] Base dixmais injoignable :', (e as Error).message);
    return [];
  }
}
