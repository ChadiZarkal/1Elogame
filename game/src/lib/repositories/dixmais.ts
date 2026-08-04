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

function buildMockStatements(): DixMaisStatement[] {
  return SEED_STATEMENTS.map((s, i) => ({
    ...s,
    id: `mock-${i}`,
    votes_count: 0,
    total_delta: 0,
    elimination_count: 0,
    avg_delta: 0,
    elimination_rate: 0,
    created_at: new Date().toISOString(),
  }));
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
}

export async function recordDixMaisVote(params: RecordVoteParams): Promise<void> {
  const { statement_id, session_id, previous_score, new_score } = params;

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
  } as any);

  if (error) {
    console.warn('[VOTE] RPC failed, using fallback:', error.message);
    // Fallback: direct insert + update
    await Promise.all([
      (supabase.from('dixmais_votes') as any).insert({
        statement_id, session_id, previous_score, new_score, delta, is_elimination: isElimination,
      }),
      (supabase.from('dixmais_statements') as any).update({
        votes_count: (supabase as any).rpc('coalesce', {}),
      }).eq('id', statement_id),
    ]).catch((e: any) => console.warn('[VOTE] Fallback also failed:', e.message));
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
    .single();

  if (error) throw new Error(`Create statement error: ${error.message}`);
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

  const { data, error } = await (supabase
    .from('dixmais_statements') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Update statement error: ${error.message}`);
  return data as DixMaisStatement;
}

// ---------------------------------------------------------------------------
// Admin: delete statement
// ---------------------------------------------------------------------------
export async function deleteDixMaisStatement(id: string): Promise<void> {
  if (isMockMode()) return;

  const { createDixmaisServerClient } = await import('@/lib/supabaseDixmais');
  const supabase = createDixmaisServerClient();

  const { error } = await (supabase
    .from('dixmais_statements') as any)
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Delete statement error: ${error.message}`);
}
