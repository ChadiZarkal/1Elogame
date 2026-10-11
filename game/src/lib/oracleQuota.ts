/**
 * @module oracleQuota
 * Ce qui empêche l'Oracle de coûter une fortune.
 *
 * Chaque verdict appelle une IA payante. Avant chaque appel, on demande à la
 * base (`oracle_consommer`, migration 028) si l'adresse a encore droit à un
 * verdict, et si le plafond quotidien d'appels à l'IA est atteint :
 *
 *   'refuse' → trop de demandes depuis cette adresse : 429, pas d'appel ;
 *   'local'  → plafond du jour atteint : l'Oracle répond avec son juge local,
 *              gratuit, et la facture s'arrête là ;
 *   'ia'     → l'appel est autorisé.
 *
 * Les compteurs vivent en base parce qu'un compteur en mémoire est propre à
 * chaque instance du serveur : sur Vercel, la limite repartait de zéro d'une
 * instance à l'autre. La mémoire ne sert plus que de filet, quand la base ne
 * répond pas — mieux vaut une limite imparfaite qu'aucune.
 *
 * Les limites se règlent sans redéploiement de code, par variables
 * d'environnement (voir LIMITES).
 */

import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isMockMode } from '@/lib/apiHelpers';

export type DecisionQuota = 'ia' | 'local' | 'refuse';

function entier(nom: string, defaut: number): number {
  const valeur = Number(process.env[nom]);
  return Number.isInteger(valeur) && valeur > 0 ? valeur : defaut;
}

/**
 * L'usage réel tourne autour de huit verdicts publics par jour (octobre 2026).
 * Le plafond en laisse soixante fois plus : il ne gêne personne et borne la
 * facture à quelques dizaines de centimes par jour, quoi qu'il arrive.
 */
export function limites() {
  return {
    parMinute: entier('ORACLE_LIMITE_PAR_MINUTE', 5),
    parJour: entier('ORACLE_LIMITE_PAR_JOUR', 40),
    plafondIA: entier('ORACLE_PLAFOND_IA_JOUR', 500),
  };
}

/** L'adresse du client, telle que Vercel la transmet. */
function adresse(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'inconnue'
  );
}

/** Une empreinte de l'adresse : la base ne voit jamais d'IP en clair. */
export function empreinteAdresse(request: NextRequest): string {
  return createHash('sha256').update(`oracle:${adresse(request)}`).digest('hex').slice(0, 32);
}

// ---------------------------------------------------------------------------
// Le filet en mémoire
// ---------------------------------------------------------------------------

const compteurs = new Map<string, { n: number; fin: number }>();

function incrementer(cle: string, fenetreMs: number, maintenant: number): number {
  const c = compteurs.get(cle);
  if (!c || c.fin < maintenant) {
    compteurs.set(cle, { n: 1, fin: maintenant + fenetreMs });
    return 1;
  }
  c.n += 1;
  return c.n;
}

/** La même décision que la base, propre à cette instance du serveur. */
export function deciderEnMemoire(empreinte: string, maintenant = Date.now()): DecisionQuota {
  const { parMinute, parJour, plafondIA } = limites();
  if (compteurs.size > 10_000) {
    for (const [cle, c] of compteurs) if (c.fin < maintenant) compteurs.delete(cle);
  }
  if (incrementer(`ip-minute:${empreinte}`, 60_000, maintenant) > parMinute) return 'refuse';
  if (incrementer(`ip-jour:${empreinte}`, 86_400_000, maintenant) > parJour) return 'refuse';
  const jour = new Date(maintenant).toISOString().slice(0, 10);
  if (incrementer(`ia-jour:${jour}`, 2 * 86_400_000, maintenant) > plafondIA) return 'local';
  return 'ia';
}

/** Pour les tests. */
export function viderQuotasEnMemoire(): void {
  compteurs.clear();
}

// ---------------------------------------------------------------------------
// La décision
// ---------------------------------------------------------------------------

export async function consommerQuota(request: NextRequest): Promise<DecisionQuota> {
  const empreinte = empreinteAdresse(request);
  if (isMockMode()) return deciderEnMemoire(empreinte);

  try {
    const { createServerClient } = await import('@/lib/supabase');
    // La fonction n'est pas dans les types générés : client non typé.
    const supabase = createServerClient() as unknown as SupabaseClient;
    const { parMinute, parJour, plafondIA } = limites();
    const { data, error } = await supabase.rpc('oracle_consommer', {
      p_empreinte: empreinte,
      p_par_minute: parMinute,
      p_par_jour: parJour,
      p_plafond_ia: plafondIA,
    });
    if (error) throw new Error(error.message);
    if (data === 'ia' || data === 'local' || data === 'refuse') return data;
    throw new Error(`Réponse inattendue : ${String(data)}`);
  } catch (err) {
    // Le client Supabase ne lève pas, il rend `{ error }` : c'est vérifié
    // au-dessus, et journalisé ici pour qu'une panne ne passe pas inaperçue.
    console.error('[Oracle] Quotas en base indisponibles, repli en mémoire :', err instanceof Error ? err.message : err);
    return deciderEnMemoire(empreinte);
  }
}
