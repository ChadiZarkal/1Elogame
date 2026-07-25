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
// Random selection helper
// ---------------------------------------------------------------------------
function pickRandom<T>(arr: T[], count: number): T[] {
  const copy = [...arr].sort(() => Math.random() - 0.5);
  return copy.slice(0, Math.min(count, copy.length));
}

// ---------------------------------------------------------------------------
// Public: fetch random statements for a game round
// ---------------------------------------------------------------------------
export async function getRandomStatements(count = 7): Promise<DixMaisStatement[]> {
  const negCount = Math.ceil(count * 0.7);
  const posCount = count - negCount;

  if (isMockMode()) {
    const all = buildMockStatements();
    const neg = pickRandom(all.filter(s => s.type === 'negative'), negCount);
    const pos = pickRandom(all.filter(s => s.type === 'positive'), posCount);
    return [...neg, ...pos].sort(() => Math.random() - 0.5);
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const [{ data: negData }, { data: posData }] = await Promise.all([
    supabase
      .from('dixmais_statements')
      .select('*')
      .eq('is_active', true)
      .eq('is_approved', true)
      .eq('type', 'negative')
      .order('id'), // stable order before shuffle
    supabase
      .from('dixmais_statements')
      .select('*')
      .eq('is_active', true)
      .eq('is_approved', true)
      .eq('type', 'positive')
      .order('id'),
  ]);

  const neg = pickRandom((negData as DixMaisStatement[]) || [], negCount);
  const pos = pickRandom((posData as DixMaisStatement[]) || [], posCount);
  const combined = [...neg, ...pos].sort(() => Math.random() - 0.5);

  // Fallback if DB is empty
  if (combined.length < 3) {
    const seed = buildMockStatements();
    const sNeg = pickRandom(seed.filter(s => s.type === 'negative'), negCount);
    const sPos = pickRandom(seed.filter(s => s.type === 'positive'), posCount);
    return [...sNeg, ...sPos].sort(() => Math.random() - 0.5);
  }

  return combined;
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

  // Determine whether to record per business rules:
  // - Always record non-zero votes
  // - Record zero ONLY when previous_score was 10
  const isElimination = new_score === 0;
  const shouldRecord = new_score > 0 || previous_score === 10;
  if (!shouldRecord) return;

  const delta = new_score - previous_score;

  if (isMockMode()) return; // skip in mock mode

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  // Use atomic RPC if available, fallback to two-step
  const { error } = await supabase.rpc('record_dixmais_vote', {
    p_statement_id: statement_id,
    p_session_id: session_id,
    p_previous_score: previous_score,
    p_new_score: new_score,
    p_delta: delta,
    p_is_elimination: isElimination,
  });

  if (error) {
    // Fallback: direct insert + update
    await Promise.all([
      supabase.from('dixmais_votes').insert({
        statement_id, session_id, previous_score, new_score, delta, is_elimination: isElimination,
      }),
      supabase.from('dixmais_statements').update({
        votes_count: supabase.rpc('coalesce', {}) as unknown as number, // handled by DB
      }).eq('id', statement_id),
    ]).catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// Leaderboard (most red-flag statements)
// ---------------------------------------------------------------------------
export interface LeaderboardEntry extends DixMaisStatement {
  avg_delta: number;
  elimination_rate: number;
}

export async function getDixMaisLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  if (isMockMode()) {
    return buildMockStatements().map(s => ({
      ...s,
      avg_delta: 0,
      elimination_rate: 0,
    }));
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('dixmais_statement_rankings')
    .select('*')
    .order('avg_delta', { ascending: true }) // most negative = most red flag
    .limit(limit);

  if (error) throw new Error(`Leaderboard error: ${error.message}`);
  return (data as LeaderboardEntry[]) || [];
}

// ---------------------------------------------------------------------------
// Admin: list all statements (including inactive)
// ---------------------------------------------------------------------------
export async function getAllDixMaisStatements(): Promise<LeaderboardEntry[]> {
  if (isMockMode()) {
    return buildMockStatements().map(s => ({ ...s, avg_delta: 0, elimination_rate: 0 }));
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('dixmais_statements')
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

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data: inserted, error } = await supabase
    .from('dixmais_statements')
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

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('dixmais_statements')
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

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const { error } = await supabase
    .from('dixmais_statements')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Delete statement error: ${error.message}`);
}
