/**
 * @module repositories/dixmais
 * Data access layer for the "C'est un 10 mais..." game.
 */

import type { DixMaisStatement, DixMaisVote } from '@/types/database';
import { isMockMode } from '@/lib/apiHelpers';

// ---------------------------------------------------------------------------
// Fallback seed data (used when mock mode or DB is empty)
// ---------------------------------------------------------------------------
const SEED_STATEMENTS: Omit<DixMaisStatement, 'id' | 'created_at' | 'votes_count' | 'total_delta' | 'elimination_count' | 'avg_delta' | 'elimination_rate'>[] = [
  { text: 'Il est de droite',                      type: 'negative', category: 'politique',  is_active: true, is_approved: true },
  { text: 'Il vote Marine Le Pen',                 type: 'negative', category: 'politique',  is_active: true, is_approved: true },
  { text: 'Il est souvent violent',                type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il a trompé ses 3 dernières copines',   type: 'negative', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il est jaloux maladif',                 type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il est manipulateur',                   type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il est misogyne',                       type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il ne fait jamais la vaisselle',        type: 'negative', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il parle de son ex constamment',        type: 'negative', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il fume un paquet par jour',            type: 'negative', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il boit beaucoup tous les week-ends',   type: 'negative', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il est accro aux jeux vidéo',           type: 'negative', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il est hyper radin',                    type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il fait des crises en public',          type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il n\'a aucune empathie',               type: 'negative', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il n\'aime pas les animaux',            type: 'negative', category: 'social',     is_active: true, is_approved: true },
  { text: 'Il ne lit jamais',                      type: 'negative', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il envoie des SMS à 3h du matin',       type: 'negative', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il est ghosteur chronique',             type: 'negative', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il est complotiste',                    type: 'negative', category: 'politique',  is_active: true, is_approved: true },
  { text: 'Il est hyper drôle et créatif',         type: 'positive', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il est très attentionné',               type: 'positive', category: 'caractere',  is_active: true, is_approved: true },
  { text: 'Il paye toujours les dîners',           type: 'positive', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il est très proche de sa famille',      type: 'positive', category: 'dating',     is_active: true, is_approved: true },
  { text: 'Il cuisine très bien',                  type: 'positive', category: 'lifestyle',  is_active: true, is_approved: true },
  { text: 'Il gagne 8 000€ par mois',              type: 'positive', category: 'argent',     is_active: true, is_approved: true },
  { text: 'Il donne beaucoup aux associations',    type: 'positive', category: 'social',     is_active: true, is_approved: true },
  { text: 'Il parle à son psy régulièrement',      type: 'positive', category: 'sante',      is_active: true, is_approved: true },
  { text: 'Il est passionné par son métier',       type: 'positive', category: 'travail',    is_active: true, is_approved: true },
  { text: 'Il adore les animaux',                  type: 'positive', category: 'social',     is_active: true, is_approved: true },
];

/**
 * Compteurs simulés, déduits du rang de la phrase.
 *
 * À zéro, le mode simulé ne pouvait exercer aucune des comparaisons à la
 * communauté : la sévérité, le taux d'élimination et le rapport de session
 * passent tous par le seuil de `MIN_VOTES_FOR_COMPARISON`, et restaient donc
 * invisibles en développement — c'est-à-dire justement là où on les vérifie.
 *
 * Déterministe et non aléatoire : deux chargements de suite doivent montrer
 * les mêmes chiffres, sinon rien n'est reproductible.
 */
function mockStats(index: number, type: 'positive' | 'negative') {
  const votes = 12 + ((index * 7) % 40);
  // Les red flags coûtent, les green flags rapportent : l'ordre de grandeur
  // suit celui observé en production (entre −1 et −6 par révélation).
  const moyenne = type === 'negative' ? -1 - ((index * 3) % 5) : 0.5 + ((index * 2) % 3) * 0.5;
  const tauxElimination = type === 'negative' ? ((index * 11) % 60) / 100 : 0;

  return {
    votes_count: votes,
    total_delta: Math.round(moyenne * votes),
    elimination_count: Math.round(tauxElimination * votes),
  };
}

function buildMockStatements(): DixMaisStatement[] {
  return SEED_STATEMENTS.map((s, i) => {
    const stats = mockStats(i, s.type);
    return {
      ...s,
      ...stats,
      id: `mock-${i}`,
      avg_delta: stats.total_delta / stats.votes_count,
      elimination_rate: (stats.elimination_count / stats.votes_count) * 100,
      created_at: new Date().toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Random selection helpers
// ---------------------------------------------------------------------------

/** Uniform in-place Fisher-Yates shuffle (unlike `sort(() => Math.random() - 0.5)`,
 * which is biased and does not produce an even distribution). */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, Math.max(0, Math.min(count, arr.length)));
}

/** Comparaison d'énoncés à la casse, aux espaces doubles et aux blancs de bord près. */
function textKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Un seul énoncé par texte.
 *
 * La table compte aujourd'hui ~204 lignes actives et approuvées pour seulement
 * ~76 textes distincts : la plupart des énoncés y figurent en trois exemplaires,
 * sous trois id différents. Comme la liste d'exclusion du client raisonne sur
 * des id, un doublon revenait indéfiniment sous un autre id sans jamais être
 * filtré — c'est ce qui donnait au joueur l'impression de tourner sur une
 * poignée de phrases alors que le catalogue paraissait fourni.
 *
 * Le représentant retenu est le **plus petit id**, et non un tirage au sort : il
 * faut qu'un texte donné renvoie toujours le même id, sinon l'exclusion cesse
 * d'opérer dès le tour suivant. Pour la même raison, la déduplication doit
 * précéder le filtrage par exclusion — dans l'autre ordre, écarter le
 * représentant ferait simplement remonter son doublon.
 */
function dedupeByText(list: DixMaisStatement[]): DixMaisStatement[] {
  const kept = new Map<string, DixMaisStatement>();
  for (const statement of list) {
    const key = textKey(statement.text);
    const current = kept.get(key);
    if (!current || statement.id < current.id) kept.set(key, statement);
  }
  return [...kept.values()];
}

/** The opening statement of a profile must always be a red flag — swap it with
 * the first negative statement in the list if the shuffle put a positive first.
 * No-op if there is no negative to swap with (fully-positive round). */
function ensureFirstIsNegative(list: DixMaisStatement[]): DixMaisStatement[] {
  if (list.length === 0 || list[0].type !== 'positive') return list;
  const negIdx = list.findIndex(s => s.type === 'negative');
  if (negIdx === -1) return list;
  const copy = [...list];
  [copy[0], copy[negIdx]] = [copy[negIdx], copy[0]];
  return copy;
}

/** Picks negCount/posCount from the (already exclude-filtered) pools, topping up
 * from whichever pool has leftovers if one side runs short, so a session doesn't
 * degrade to fewer statements than requested just because e.g. all unseen
 * negatives were exhausted. */
function selectFromPools(
  negPool: DixMaisStatement[],
  posPool: DixMaisStatement[],
  count: number,
): DixMaisStatement[] {
  const negCount = Math.ceil(count * 0.7);
  const posCount = count - negCount;

  const neg = pickRandom(negPool, negCount);
  const pos = pickRandom(posPool, posCount);
  let combined = [...neg, ...pos];

  if (combined.length < count) {
    const usedIds = new Set(combined.map(s => s.id));
    const leftover = [...negPool, ...posPool].filter(s => !usedIds.has(s.id));
    const need = count - combined.length;
    combined = [...combined, ...pickRandom(leftover, need)];
  }

  return ensureFirstIsNegative(shuffle(combined));
}

// ---------------------------------------------------------------------------
// Public: fetch random statements for a game round
// ---------------------------------------------------------------------------
export async function getRandomStatements(count = 7, excludeIds: string[] = []): Promise<DixMaisStatement[]> {
  const exclude = new Set(excludeIds);

  if (isMockMode()) {
    const all = dedupeByText(buildMockStatements()).filter(s => !exclude.has(s.id));
    return selectFromPools(
      all.filter(s => s.type === 'negative'),
      all.filter(s => s.type === 'positive'),
      count,
    );
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  const [{ data: negData }, { data: posData }] = await Promise.all([
    (supabase
      .from('dixmais_statements') as any)
      .select('*')
      .eq('is_active', true)
      .eq('is_approved', true)
      .eq('type', 'negative')
      .order('id'), // stable order before shuffle
    (supabase
      .from('dixmais_statements') as any)
      .select('*')
      .eq('is_active', true)
      .eq('is_approved', true)
      .eq('type', 'positive')
      .order('id'),
  ]);

  // Dédupliquer d'abord, exclure ensuite : cet ordre est ce qui rend
  // l'exclusion par id fiable face aux doublons de la table.
  const negAll = dedupeByText((negData as DixMaisStatement[]) || []);
  const posAll = dedupeByText((posData as DixMaisStatement[]) || []);

  // Repli sur le jeu de départ **uniquement** si la table est vide ou
  // inaccessible — jamais parce que la réserve non vue s'est tarie. Les énoncés
  // codés en dur portent des id absents de la base : servis en cours de partie,
  // ils feraient rejeter tous les votes suivants.
  if (negAll.length + posAll.length === 0) {
    const seed = dedupeByText(buildMockStatements());
    return selectFromPools(
      seed.filter(s => s.type === 'negative'),
      seed.filter(s => s.type === 'positive'),
      count,
    );
  }

  const combined = selectFromPools(
    negAll.filter(s => !exclude.has(s.id)),
    posAll.filter(s => !exclude.has(s.id)),
    count,
  );

  // Moins de trois énoncés ne fait pas un profil jouable. Liste vide plutôt
  // qu'une manche tronquée : le client y lit un tour de catalogue terminé,
  // vide sa liste d'exclusion et repart proprement du début.
  return combined.length >= 3 ? combined : [];
}

// ---------------------------------------------------------------------------
// Public: record a vote (fire-and-forget safe)
// ---------------------------------------------------------------------------
export interface RecordVoteParams {
  statement_id: string;
  session_id: string;
  previous_score: number;
  new_score: number;
  /** Profil du votant, quand il est connu. Facultatif : un vote anonyme reste
   * un vote, il compte simplement dans la moyenne générale et dans aucune
   * cohorte. */
  sex?: string | null;
  age?: string | null;
}

export async function recordDixMaisVote(params: RecordVoteParams): Promise<void> {
  const { statement_id, session_id, previous_score, new_score, sex, age } = params;

  const isElimination = new_score === 0;
  const delta = new_score - previous_score;

  if (isMockMode()) {
    console.log('[MOCK] Vote recorded:', { statement_id, previous_score, new_score, delta });
    return;
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  // Use atomic RPC if available, fallback to two-step
  const { error } = await supabase.rpc('record_dixmais_vote', {
    p_statement_id: statement_id,
    p_session_id: session_id,
    p_previous_score: previous_score,
    p_new_score: new_score,
    p_delta: delta,
    p_is_elimination: isElimination,
    p_sex: sex ?? null,
    p_age: age ?? null,
  } as any);

  if (error) {
    console.warn('[VOTE] RPC indisponible, repli :', error.message);
    // Repli quand le RPC atomique ne répond pas (il arrive qu'il expire en 504).
    //
    // L'ancien repli passait un PostgrestFilterBuilder comme valeur de
    // `votes_count` : PostgREST répondait 400 à tous les coups, et les votes
    // arrivés par ce chemin n'étaient jamais comptés dans le classement, alors
    // même que la ligne de vote, elle, était bien insérée.
    //
    // Lecture puis écriture : deux votes simultanés sur le même énoncé peuvent
    // se télescoper et en perdre un, ce qui vaut mieux qu'un échec certain. Le
    // chemin normal reste le RPC, atomique.
    try {
      // Sans `sex` ni `age` : ce repli sert aussi quand la base n'a pas encore
      // reçu la migration 021, cas où ces colonnes n'existent pas et où les
      // nommer ferait échouer l'insertion. Le vote vaut mieux que le profil.
      await (supabase.from('dixmais_votes') as any).insert({
        statement_id, session_id, previous_score, new_score, delta, is_elimination: isElimination,
      });

      const { data: compteurs } = await (supabase
        .from('dixmais_statements') as any)
        .select('votes_count, total_delta, elimination_count')
        .eq('id', statement_id)
        .maybeSingle();

      if (compteurs) {
        await (supabase.from('dixmais_statements') as any).update({
          votes_count: Number(compteurs.votes_count) + 1,
          total_delta: Number(compteurs.total_delta) + delta,
          elimination_count: Number(compteurs.elimination_count) + (isElimination ? 1 : 0),
        }).eq('id', statement_id);
      }
    } catch (e: any) {
      console.warn('[VOTE] Repli en échec lui aussi :', e?.message);
    }
  }
}

// ---------------------------------------------------------------------------
// Leaderboard (most red-flag statements)
// ---------------------------------------------------------------------------
export interface LeaderboardEntry extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
}

/**
 * Réunit les exemplaires d'un même énoncé.
 *
 * La table contient le même texte sur plusieurs lignes, et chacune n'a récolté
 * qu'une part des votes. Sans regroupement, le classement affichait trois fois
 * la même phrase, chacune avec une moyenne calculée sur un tiers des votes.
 *
 * Les compteurs bruts s'additionnent et les taux sont recalculés sur le total :
 * moyenner les moyennes donnerait un résultat faux dès que les exemplaires
 * n'ont pas reçu le même nombre de votes, ce qui est le cas général.
 */
function aggregateByText(rows: LeaderboardEntry[]): LeaderboardEntry[] {
  const merged = new Map<string, LeaderboardEntry>();

  for (const row of rows) {
    const key = textKey(row.text);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...row });
      continue;
    }
    current.votes_count += row.votes_count;
    current.total_delta += row.total_delta;
    current.elimination_count += row.elimination_count;
    // Même représentant que la sélection en jeu, pour que les deux écrans
    // désignent la même ligne.
    if (row.id < current.id) current.id = row.id;
  }

  return [...merged.values()].map(row => ({
    ...row,
    avg_delta: row.votes_count > 0 ? row.total_delta / row.votes_count : 0,
    elimination_rate: row.votes_count > 0 ? (row.elimination_count / row.votes_count) * 100 : 0,
  }));
}

export async function getDixMaisLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  if (isMockMode()) {
    return dedupeByText(buildMockStatements()).map(s => ({
      ...s,
      avg_delta: 0,
      elimination_rate: 0,
    }));
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  // Toutes les lignes, et non les `limit` premières : les exemplaires d'un même
  // énoncé doivent être réunis **avant** le classement. Trancher d'abord
  // reviendrait à n'additionner que les votes des copies ayant passé la coupe,
  // et le tri porterait sur des totaux arbitrairement amputés.
  const { data, error } = await (supabase
    .from('dixmais_statement_rankings') as any)
    .select('*');

  if (error) throw new Error(`Leaderboard error: ${error.message}`);

  return aggregateByText((data as LeaderboardEntry[]) || [])
    .sort((a, b) => a.avg_delta - b.avg_delta) // most negative = most red flag
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Admin: list all statements (including inactive)
// ---------------------------------------------------------------------------
export async function getAllDixMaisStatements(): Promise<LeaderboardEntry[]> {
  if (isMockMode()) {
    return buildMockStatements().map(s => ({ ...s, avg_delta: 0, elimination_rate: 0 }));
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  const { data, error } = await (supabase
    .from('dixmais_statements') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Admin fetch error: ${error.message}`);
  return ((data as DixMaisStatement[]) || []).map(s => ({
    ...s,
    avg_delta: s.votes_count > 0 ? s.total_delta / s.votes_count : 0,
    elimination_rate: s.votes_count > 0 ? (s.elimination_count / s.votes_count) * 100 : 0,
  }));
}

// ---------------------------------------------------------------------------
// Admin: écritures
// ---------------------------------------------------------------------------

/**
 * Message d'erreur d'écriture, enrichi du diagnostic le plus probable.
 *
 * `createDixmaisServerClient` retombe sur la clé anon quand la clé service role
 * est absente. La RLS du projet n'autorise alors que la lecture : le jeu
 * continue de tourner et le backoffice affiche bien la liste, mais INSERT,
 * UPDATE et DELETE sont refusés. PostgREST répond soit une erreur brute
 * incompréhensible pour l'opérateur, soit — pour UPDATE et DELETE — aucune
 * erreur du tout et zéro ligne touchée. D'où ce message explicite plutôt que le
 * texte natif seul.
 */
/**
 * Un énoncé déjà présent, refusé par l'index unique de la migration 020.
 *
 * Le message natif de PostgreSQL — « duplicate key value violates unique
 * constraint » — ne dit rien à qui vient de saisir une affirmation. Celui-ci
 * nomme la cause et la règle de comparaison, la même que `textKey`.
 */
function doublonRefuse(error: { code?: string } | null | undefined): Error | null {
  if (error?.code !== '23505') return null;
  return new Error(
    "Cette affirmation existe déjà : un énoncé identique est enregistré (la comparaison ignore la casse et les espaces en trop).",
  );
}

function writeError(action: string, detail: string): Error {
  const hasServiceRole = Boolean(process.env.SUPABASE_DIXMAIS_SERVICE_ROLE_KEY);
  const hint = hasServiceRole
    ? ''
    : " — SUPABASE_DIXMAIS_SERVICE_ROLE_KEY n'est pas définie : le serveur écrit avec la clé anon, que la RLS refuse. Ajoute la clé service role du projet Supabase dédié à « C'est un 10 mais... » dans les variables d'environnement, puis redéploie.";
  return new Error(`Impossible de ${action} l'affirmation : ${detail}${hint}`);
}

// ---------------------------------------------------------------------------
// Admin: create statement
// ---------------------------------------------------------------------------
export async function createDixMaisStatement(data: {
  text: string;
  type: 'positive' | 'negative';
  category: string;
}): Promise<DixMaisStatement> {
  if (isMockMode()) {
    return { ...data, id: `mock-${Date.now()}`, is_active: true, is_approved: true, votes_count: 0, total_delta: 0, elimination_count: 0, created_at: new Date().toISOString() };
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  const { data: inserted, error } = await (supabase
    .from('dixmais_statements') as any)
    .insert({ text: data.text, type: data.type, category: data.category })
    .select()
    .maybeSingle();

  if (error) throw doublonRefuse(error) ?? writeError('créer', error.message);
  // Insertion acceptée mais aucune ligne relue : cas théorique où la RLS
  // autorise INSERT sans autoriser la relecture. Ne pas fabriquer une ligne
  // sans id — le backoffice l'afficherait avec des boutons modifier/supprimer
  // inopérants. On prévient du doublon possible et on laisse rafraîchir.
  if (!inserted) {
    throw writeError('créer', "l'insertion est passée mais la ligne n'a pas pu être relue. Rafraîchis la liste avant de réessayer, sinon tu créeras un doublon");
  }
  return inserted as DixMaisStatement;
}

// ---------------------------------------------------------------------------
// Admin: update statement
// ---------------------------------------------------------------------------
export async function updateDixMaisStatement(id: string, updates: Partial<Pick<DixMaisStatement, 'text' | 'type' | 'category' | 'is_active' | 'is_approved'>>): Promise<DixMaisStatement> {
  if (isMockMode()) {
    return { id, text: '', type: 'negative', category: 'general', is_active: true, is_approved: true, votes_count: 0, total_delta: 0, elimination_count: 0, created_at: new Date().toISOString(), ...updates };
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  // `.select()` sans `.single()` : une mise a jour qui ne touche aucune ligne
  // n'est pas une erreur PostgREST, elle renvoie une liste vide. Avec
  // `.single()` l'appel échouait sur un message de désérialisation qui ne
  // désignait pas la vraie cause.
  const { data, error } = await (supabase
    .from('dixmais_statements') as any)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw doublonRefuse(error) ?? writeError('modifier', error.message);

  const rows = (data as DixMaisStatement[]) ?? [];
  if (rows.length === 0) {
    throw writeError('modifier', `aucune ligne modifiée pour l'id ${id} (id introuvable ou écriture refusée par la RLS)`);
  }
  return rows[0];
}

// ---------------------------------------------------------------------------
// Admin: delete statement
// ---------------------------------------------------------------------------
export async function deleteDixMaisStatement(id: string): Promise<void> {
  if (isMockMode()) return;

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  // Même raison que pour l'update : sans `.select()`, une suppression bloquée
  // par la RLS répondait 200 sans rien supprimer, et le backoffice retirait la
  // ligne de l'écran alors qu'elle était toujours en base.
  const { data, error } = await (supabase
    .from('dixmais_statements') as any)
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw writeError('supprimer', error.message);
  if (((data as { id: string }[]) ?? []).length === 0) {
    throw writeError('supprimer', `aucune ligne supprimée pour l'id ${id} (id introuvable ou suppression refusée par la RLS)`);
  }
}

// ---------------------------------------------------------------------------
// Cohorte : comment votent les gens du même sexe et du même âge
// ---------------------------------------------------------------------------

/**
 * Aucun seuil par énoncé.
 *
 * La première version en exigeait huit, par symétrie avec la moyenne générale.
 * Mesuré sur les données réelles, c'était inatteignable : avec 161 énoncés au
 * catalogue, l'énoncé le mieux couvert de la plus grosse cohorte plafonnait à
 * cinq votes, et il aurait fallu quelque 1 300 votes *par cohorte* pour que la
 * comparaison s'affiche une seule fois. Une statistique qui ne sort jamais ne
 * protège de rien.
 *
 * Le bruit est écarté autrement, et mieux : la comparaison porte sur la moyenne
 * de plusieurs dizaines d'énoncés (voir `compareToCohort`), ce qui dilue une
 * estimation isolée bien plus sûrement qu'un plancher par énoncé. Ce qui compte
 * est le nombre total de votes derrière la comparaison, et il est vérifié là-bas.
 */
export const MIN_COHORT_VOTES = 1;

export interface CohortStat {
  statement_id: string;
  votes: number;
  avg_delta: number;
  elimination_rate: number;
}

/**
 * Moyennes d'une cohorte, énoncé par énoncé.
 *
 * Phrase par phrase, et non en bloc : comparer la moyenne du joueur à la
 * moyenne de la cohorte sur *tous* les énoncés mesurerait surtout la différence
 * entre les deux paniers d'énoncés tirés, pas une différence de sévérité.
 *
 * Rend une liste vide — et non une erreur — quand la fonction n'existe pas
 * encore en base : la comparaison par cohorte disparaît alors de l'écran, le
 * reste du rapport tient debout.
 */
export async function getDixMaisCohortStats(
  statementIds: string[],
  sex: string | null,
  age: string | null,
): Promise<CohortStat[]> {
  if (statementIds.length === 0) return [];

  if (isMockMode()) {
    // Cohorte simulée, un cran plus sévère que la moyenne générale : de quoi
    // voir le bloc de comparaison en développement.
    return statementIds.map((id, i) => ({
      statement_id: id,
      votes: MIN_COHORT_VOTES + ((i * 5) % 20),
      avg_delta: -2 - ((i * 3) % 4),
      elimination_rate: ((i * 13) % 50),
    }));
  }

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  const { data, error } = await supabase.rpc('dixmais_cohort_stats', {
    p_statement_ids: statementIds,
    p_sex: sex,
    p_age: age,
  } as any);

  if (error) {
    console.warn('[COHORTE] Lecture impossible :', error.message);
    return [];
  }

  return ((data as CohortStat[]) ?? []).filter((row) => row.votes >= MIN_COHORT_VOTES);
}
