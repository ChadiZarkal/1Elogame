/**
 * @module repositories/community
 * Data access layer for Flag or Not community submissions.
 */

import { isMockMode } from '@/lib/apiHelpers';
import type { CommunitySubmission } from '@/types/analytics';
import { sanitizeText } from '@/lib/sanitize';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';

// In-memory store for mock mode
const mockCommunityStore: CommunitySubmission[] = [];

const JUSTIFICATION_COLUMNS = ['justification', 'justification_ai', 'justification_ia', 'justif'] as const;
const GENDER_COLUMNS = ['gender', 'genre', 'sexe'] as const;
const CORE_SUBMISSION_COLUMNS = new Set(['id', 'text', 'verdict', 'created_at', ...JUSTIFICATION_COLUMNS, ...GENDER_COLUMNS]);

function hasMissingColumnError(message: string | null | undefined, columnName: string): boolean {
  const normalized = (message || '').toLowerCase();
  const column = columnName.toLowerCase();

  return (
    (normalized.includes(`column "${column}"`) && normalized.includes('does not exist'))
    || normalized.includes(`could not find the '${column}' column`)
    || (normalized.includes('schema cache') && normalized.includes(`'${column}'`))
  );
}

function hasAnyMissingOptionalColumnError(message: string | null | undefined): boolean {
  for (const column of JUSTIFICATION_COLUMNS) {
    if (hasMissingColumnError(message, column)) return true;
  }
  for (const column of GENDER_COLUMNS) {
    if (hasMissingColumnError(message, column)) return true;
  }
  return false;
}

function pickStringField(row: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return undefined;
}

function inferJustificationField(row: Record<string, unknown>): string | undefined {
  const text = typeof row.text === 'string' ? row.text : '';
  const verdict = typeof row.verdict === 'string' ? row.verdict : '';

  for (const [key, value] of Object.entries(row)) {
    if (typeof value !== 'string' || value.trim().length === 0) continue;

    const normalizedKey = key.toLowerCase();
    const isJustificationLike = normalizedKey.includes('justif') || normalizedKey.includes('reason') || normalizedKey.includes('explain') || normalizedKey.includes('comment');
    if (!isJustificationLike) continue;

    if (value !== text && value !== verdict && value !== 'homme' && value !== 'femme' && value !== 'autre') {
      return value;
    }
  }

  let bestFallback: string | undefined;
  for (const [key, value] of Object.entries(row)) {
    if (CORE_SUBMISSION_COLUMNS.has(key)) continue;
    if (typeof value !== 'string' || value.trim().length < 16) continue;
    if (value === text || value === verdict) continue;
    if (value === 'homme' || value === 'femme' || value === 'autre') continue;

    if (!bestFallback || value.length > bestFallback.length) {
      bestFallback = value;
    }
  }

  return bestFallback;
}

function pickGenderField(row: Record<string, unknown>): 'homme' | 'femme' | 'autre' | undefined {
  const raw = pickStringField(row, GENDER_COLUMNS);
  if (raw === 'homme' || raw === 'femme' || raw === 'autre') return raw;

  for (const value of Object.values(row)) {
    if (value === 'homme' || value === 'femme' || value === 'autre') return value;
  }

  return undefined;
}

function mapSubmissionRow(row: Record<string, unknown>): CommunitySubmission {
  return {
    id: row.id as string,
    text: row.text as string,
    verdict: row.verdict as 'red' | 'green',
    justification: pickStringField(row, JUSTIFICATION_COLUMNS) || inferJustificationField(row),
    gender: pickGenderField(row),
    timestamp: new Date(row.created_at as string).getTime(),
  };
}

function buildInsertPayloads(
  text: string,
  verdict: 'red' | 'green',
  justification?: string,
  gender?: 'homme' | 'femme' | 'autre',
): Array<Record<string, unknown>> {
  const payloads: Array<Record<string, unknown>> = [];
  const basePayload: Record<string, unknown> = {
    text,
    verdict,
  };

  if (justification && gender) {
    for (const justificationColumn of JUSTIFICATION_COLUMNS) {
      for (const genderColumn of GENDER_COLUMNS) {
        payloads.push({
          ...basePayload,
          [justificationColumn]: justification,
          [genderColumn]: gender,
        });
      }
    }
  }

  if (justification) {
    for (const justificationColumn of JUSTIFICATION_COLUMNS) {
      payloads.push({
        ...basePayload,
        [justificationColumn]: justification,
      });
    }
  }

  if (gender) {
    for (const genderColumn of GENDER_COLUMNS) {
      payloads.push({
        ...basePayload,
        [genderColumn]: gender,
      });
    }
  }

  payloads.push(basePayload);
  return payloads;
}

/** Get recent community submissions. */
export async function getRecentSubmissions(limit = 20): Promise<CommunitySubmission[]> {
  if (isMockMode()) {
    return mockCommunityStore.slice(-limit).reverse();
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('flagornot_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`DB error fetching submissions: ${error.message}`);
  return (data || []).map((row: Record<string, unknown>) => mapSubmissionRow(row));
}

/** Save a new community submission. */
export async function saveSubmission(text: string, verdict: 'red' | 'green', justification?: string, gender?: 'homme' | 'femme' | 'autre'): Promise<CommunitySubmission> {
  const sanitized = sanitizeText(text).slice(0, MAX_FLAGORNOT_TEXT_LENGTH);

  if (isMockMode()) {
    const submission: CommunitySubmission = {
      id: `mock-${Date.now()}`,
      text: sanitized,
      verdict,
      justification,
      gender,
      timestamp: Date.now(),
    };
    mockCommunityStore.push(submission);
    // Keep max 100 entries
    if (mockCommunityStore.length > 100) mockCommunityStore.splice(0, mockCommunityStore.length - 100);
    return submission;
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const payloads = buildInsertPayloads(sanitized, verdict, justification, gender);
  let lastOptionalColumnError: string | null = null;
  let inserted = false;

  for (const payload of payloads) {
    const insertResult = await typedInsert(supabase, 'flagornot_submissions', payload);

    if (!insertResult.error) {
      inserted = true;
      break;
    }

    if (!hasAnyMissingOptionalColumnError(insertResult.error.message)) {
      throw new Error(`DB error saving submission: ${insertResult.error.message}`);
    }

    lastOptionalColumnError = insertResult.error.message;
  }

  if (!inserted) {
    throw new Error(`DB error saving submission: ${lastOptionalColumnError ?? 'Unable to insert submission with known optional columns'}`);
  }

  return { id: `new-${Date.now()}`, text: sanitized, verdict, justification, gender, timestamp: Date.now() };
}

/** Get global red/green verdict counts. */
export async function getGlobalVerdictCounts(): Promise<{ red: number; green: number }> {
  if (isMockMode()) {
    const red = mockCommunityStore.filter((s) => s.verdict === 'red').length;
    const green = mockCommunityStore.filter((s) => s.verdict === 'green').length;
    return { red, green };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const [redRes, greenRes] = await Promise.all([
    supabase.from('flagornot_submissions').select('*', { count: 'exact', head: true }).eq('verdict', 'red'),
    supabase.from('flagornot_submissions').select('*', { count: 'exact', head: true }).eq('verdict', 'green'),
  ]);

  if (redRes.error) throw new Error(`DB error counting red: ${redRes.error.message}`);
  if (greenRes.error) throw new Error(`DB error counting green: ${greenRes.error.message}`);

  return { red: redRes.count ?? 0, green: greenRes.count ?? 0 };
}

/** Admin: get all submissions with pagination. */
export async function getAllSubmissions(
  options: { limit?: number; offset?: number; verdict?: 'red' | 'green' | null; search?: string | null } = {}
): Promise<{ submissions: CommunitySubmission[]; total: number }> {
  const { limit = 50, offset = 0, verdict = null, search = null } = options;

  if (isMockMode()) {
    let results = [...mockCommunityStore].reverse();
    if (verdict) results = results.filter(s => s.verdict === verdict);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(s => s.text.toLowerCase().includes(q));
    }
    return { submissions: results.slice(offset, offset + limit), total: results.length };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  let query = supabase
    .from('flagornot_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (verdict) query = query.eq('verdict', verdict);
  if (search) query = query.ilike('text', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw new Error(`DB error fetching all submissions: ${error.message}`);

  const submissions = (data || []).map((row: Record<string, unknown>) => mapSubmissionRow(row));

  return { submissions, total: count ?? 0 };
}

/** Get gender-based statistics for Oracle. */
export async function getGenderStats(): Promise<{
  total: number;
  byGender: { gender: string; total: number; red: number; green: number; redPercent: number }[];
  insights: string[];
}> {
  if (isMockMode()) {
    const genders = ['homme', 'femme', 'autre'] as const;
    const byGender = genders.map(g => {
      const items = mockCommunityStore.filter(s => s.gender === g);
      const red = items.filter(s => s.verdict === 'red').length;
      const green = items.filter(s => s.verdict === 'green').length;
      const total = items.length;
      return { gender: g, total, red, green, redPercent: total > 0 ? Math.round((red / total) * 100) : 0 };
    });
    return { total: mockCommunityStore.length, byGender, insights: generateInsights(byGender) };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  let data: Array<Record<string, unknown>> = [];
  let selectedGenderColumn: string | null = null;
  let lastMissingGenderColumnError: string | null = null;

  for (const genderColumn of GENDER_COLUMNS) {
    const queryResult = await supabase
      .from('flagornot_submissions')
      .select(`${genderColumn}, verdict`)
      .not(genderColumn, 'is', null);

    if (!queryResult.error) {
      selectedGenderColumn = genderColumn;
      data = (queryResult.data || []) as Array<Record<string, unknown>>;
      break;
    }

    if (hasMissingColumnError(queryResult.error.message, genderColumn)) {
      lastMissingGenderColumnError = queryResult.error.message;
      continue;
    }

    throw new Error(`DB error fetching gender stats: ${queryResult.error.message}`);
  }

  if (!selectedGenderColumn) {
    const fallbackInsight = lastMissingGenderColumnError
      ? '📊 Le suivi par genre n est pas encore actif sur cette base de donnees.'
      : '📊 Donnees de genre indisponibles pour le moment.';

    return {
      total: 0,
      byGender: [],
      insights: [fallbackInsight],
    };
  }

  const counts: Record<string, { red: number; green: number }> = {};
  for (const row of data) {
    const g = row[selectedGenderColumn] as string;
    if (!counts[g]) counts[g] = { red: 0, green: 0 };
    if (row.verdict === 'red') counts[g].red++;
    else counts[g].green++;
  }

  const byGender = Object.entries(counts).map(([gender, { red, green }]) => {
    const total = red + green;
    return { gender, total, red, green, redPercent: total > 0 ? Math.round((red / total) * 100) : 0 };
  });

  // Sort by total desc
  byGender.sort((a, b) => b.total - a.total);

  const totalAll = byGender.reduce((sum, g) => sum + g.total, 0);

  return { total: totalAll, byGender, insights: generateInsights(byGender) };
}

function generateInsights(byGender: { gender: string; total: number; red: number; green: number; redPercent: number }[]): string[] {
  const insights: string[] = [];
  const homme = byGender.find(g => g.gender === 'homme');
  const femme = byGender.find(g => g.gender === 'femme');

  if (homme && femme && homme.total >= 3 && femme.total >= 3) {
    if (homme.redPercent > femme.redPercent) {
      const diff = homme.redPercent - femme.redPercent;
      insights.push(`🚩 Les hommes reçoivent ${diff}% plus de Red Flags que les femmes`);
    } else if (femme.redPercent > homme.redPercent) {
      const diff = femme.redPercent - homme.redPercent;
      insights.push(`🚩 Les femmes reçoivent ${diff}% plus de Red Flags que les hommes`);
    } else {
      insights.push(`⚖️ Hommes et femmes reçoivent autant de Red Flags`);
    }

    if (homme.total > femme.total) {
      const ratio = Math.round((homme.total / femme.total) * 10) / 10;
      insights.push(`♂️ Les hommes utilisent l'Oracle ${ratio}x plus que les femmes`);
    } else if (femme.total > homme.total) {
      const ratio = Math.round((femme.total / homme.total) * 10) / 10;
      insights.push(`♀️ Les femmes utilisent l'Oracle ${ratio}x plus que les hommes`);
    }

    const hommeGreenPct = homme.total > 0 ? Math.round((homme.green / homme.total) * 100) : 0;
    const femmeGreenPct = femme.total > 0 ? Math.round((femme.green / femme.total) * 100) : 0;
    if (hommeGreenPct > femmeGreenPct + 5) {
      insights.push(`🟢 Les hommes ont ${hommeGreenPct}% de Green Flags vs ${femmeGreenPct}% chez les femmes`);
    } else if (femmeGreenPct > hommeGreenPct + 5) {
      insights.push(`🟢 Les femmes ont ${femmeGreenPct}% de Green Flags vs ${hommeGreenPct}% chez les hommes`);
    }
  }

  if (insights.length === 0) {
    insights.push(`📊 Pas assez de données pour générer des insights (besoin d'au moins 3 réponses par genre)`);
  }

  return insights;
}
