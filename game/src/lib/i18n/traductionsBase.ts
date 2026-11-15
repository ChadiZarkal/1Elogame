/**
 * @module lib/i18n/traductionsBase
 * Les traductions anglaises saisies dans l'administration (2026-11-15).
 *
 * POURQUOI
 *   Les jeux sont traduits à la sortie des API par des dictionnaires écrits
 *   dans le code (`lib/jeu/elementsEn`, `lib/rft/traduction`,
 *   `lib/dixmais/enoncesEn`). Un contenu ajouté dans l'admin restait en
 *   français sous `/en` jusqu'à ce qu'un développeur complète le dictionnaire.
 *   La table `traductions` (migrations 033 et 034) permet de le faire depuis
 *   la zone « Traduction » de chaque panneau.
 *
 * ORDRE DE LECTURE
 *   1. la table (ce que l'admin a saisi) ;
 *   2. le dictionnaire du code ;
 *   3. le français tel quel.
 *   Tout est indexé par le texte français normalisé (`cleTraduction`), comme
 *   les dictionnaires : un texte réécrit perd sa traduction.
 *
 * LA LECTURE RESTE SYNCHRONE
 *   Les fonctions de traduction (`traduireElement`, `traduire`,
 *   `traduireEnonce`) sont appelées dans des boucles, à plusieurs étages.
 *   Plutôt que de les rendre asynchrones partout, la route ou la page anglaise
 *   appelle d'abord `chargerTraductions(source)`, qui garnit un cache gardé
 *   une minute ; la traduction lit ensuite ce cache. Si le chargement n'a pas
 *   eu lieu, ou si la table manque, on retombe sur le dictionnaire : jamais
 *   d'erreur pour le joueur.
 *
 * COÛT
 *   Une requête par source et par minute, par instance de serveur, et
 *   seulement pour les pages anglaises.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase';
import { createDixmaisServerClient } from '@/lib/supabaseDixmais';

/** Un jeu, une base : « Le pire des deux » et le Red Flag Test sur la principale, dixmais sur la sienne. */
export type SourceTraduction = 'jeu' | 'rft' | 'dixmais';

export const SOURCES_TRADUCTION: readonly SourceTraduction[] = ['jeu', 'rft', 'dixmais'];

/** Apostrophes, espaces insécables : la base, la maquette et l'admin n'écrivent pas pareil. */
export function cleTraduction(texte: string): string {
  return texte.replace(/[’‘]/g, "'").replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const DUREE_CACHE_MS = 60_000;

interface Cache {
  table: Map<string, string>;
  expire: number;
}

/*
 * Le cache et, en mode maquette, la « base » elle-même, sur `globalThis` : en
 * développement, chaque route a son propre exemplaire des modules, et l'admin
 * doit voir ce que le jeu lit.
 */
const g = globalThis as unknown as {
  __traductionsCache?: Map<SourceTraduction, Cache>;
  __traductionsMaquette?: Map<SourceTraduction, Map<string, LigneTraduction>>;
  __traductionsAbsente?: Set<SourceTraduction>;
};
const caches = (g.__traductionsCache ??= new Map());
const maquette = (g.__traductionsMaquette ??= new Map());
const absentes = (g.__traductionsAbsente ??= new Set());

/** Ce que la zone affiche pour un texte. */
export interface EtatTraduction {
  fr: string;
  /** Ce que le joueur anglais voit : la saisie, sinon le dictionnaire ; `null` s'il voit le français. */
  en: string | null;
  origine: 'admin' | 'code' | null;
  /** Le dictionnaire du code, même quand une saisie le remplace. */
  code: string | null;
}

export interface LigneTraduction {
  cle: string;
  texteFr: string;
  texteEn: string;
  modifieLe: string;
}

function estMaquette(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}

function client(source: SourceTraduction): SupabaseClient {
  // La table n'est pas dans les types générés : client non typé.
  return (source === 'dixmais' ? createDixmaisServerClient() : createServerClient()) as unknown as SupabaseClient;
}

/** `42P01` : relation inconnue, la migration n'a pas été jouée. `PGRST205` : idem, vu par PostgREST. */
function tableManquante(erreur: { code?: string; message?: string }): boolean {
  return erreur.code === '42P01' || erreur.code === 'PGRST205' || /traductions/.test(erreur.message ?? '') && /exist|find/.test(erreur.message ?? '');
}

/** Toutes les traductions saisies pour un jeu. */
export async function listerTraductions(source: SourceTraduction): Promise<LigneTraduction[]> {
  if (estMaquette()) return [...(maquette.get(source)?.values() ?? [])];
  const { data, error } = await client(source)
    .from('traductions')
    .select('cle, texte_fr, texte_en, modifie_le')
    .eq('source', source);
  if (error) {
    if (tableManquante(error)) {
      absentes.add(source);
      return [];
    }
    throw new Error(error.message);
  }
  absentes.delete(source);
  return (data ?? []).map((l) => ({ cle: l.cle, texteFr: l.texte_fr, texteEn: l.texte_en, modifieLe: l.modifie_le }));
}

/** La table manque-t-elle dans la base de ce jeu ? Connu après un premier chargement. */
export function tableAbsente(source: SourceTraduction): boolean {
  return absentes.has(source);
}

/**
 * Garnit le cache d'un jeu, une fois par minute au plus. À appeler avant de
 * traduire en anglais. Ne lève jamais : en cas d'échec, le dictionnaire suffit.
 */
export async function chargerTraductions(source: SourceTraduction): Promise<void> {
  const c = caches.get(source);
  if (c && c.expire > Date.now()) return;
  let table = new Map<string, string>();
  try {
    table = new Map((await listerTraductions(source)).map((l) => [l.cle, l.texteEn]));
  } catch (e) {
    console.warn(`[traductions] lecture impossible (${source}), dictionnaire seul`, e);
    // On garde l'ancien cache s'il y en a un : mieux vaut une minute de retard qu'un retour au français.
    if (c) table = c.table;
  }
  caches.set(source, { table, expire: Date.now() + DUREE_CACHE_MS });
}

/** La traduction saisie dans l'admin, si le cache l'a. */
export function traductionSaisie(source: SourceTraduction, texte: string): string | undefined {
  return caches.get(source)?.table.get(cleTraduction(texte));
}

/**
 * Enregistre (ou, avec un anglais vide, retire) la traduction d'un texte. Le
 * cache de ce jeu est vidé : l'instance qui écrit voit tout de suite le
 * changement, les autres dans la minute.
 */
export async function enregistrerTraduction(source: SourceTraduction, texteFr: string, texteEn: string): Promise<void> {
  const cle = cleTraduction(texteFr);
  const en = texteEn.trim();
  if (!cle) throw new Error('Texte français vide');
  caches.delete(source);

  if (estMaquette()) {
    const m = maquette.get(source) ?? new Map<string, LigneTraduction>();
    maquette.set(source, m);
    if (en) m.set(cle, { cle, texteFr, texteEn: en, modifieLe: new Date().toISOString() });
    else m.delete(cle);
    return;
  }

  const table = client(source).from('traductions');
  const { error } = en
    ? await table.upsert({ source, cle, texte_fr: texteFr, texte_en: en, modifie_le: new Date().toISOString() })
    : await table.delete().eq('source', source).eq('cle', cle);
  if (error) {
    if (tableManquante(error)) {
      absentes.add(source);
      throw new Error(
        `La table « traductions » n'existe pas encore dans cette base : il faut jouer la migration ${source === 'dixmais' ? '034_dixmais_traductions.sql' : '033_traductions.sql'}.`,
      );
    }
    throw new Error(error.message);
  }
}

/** `chargerTraductions`, seulement quand la page demandée est anglaise. */
export async function chargerSiAnglais(source: SourceTraduction, langue: 'fr' | 'en'): Promise<void> {
  if (langue === 'en') await chargerTraductions(source);
}
