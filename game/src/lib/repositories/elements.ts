/**
 * @module repositories/elements
 * Data access layer for game elements.
 * Abstracts mock/Supabase storage — routes never need to know which is active.
 */

import { Element } from '@/types/database';
import { isMockMode } from '@/lib/apiHelpers';

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

/** Fetch all active elements, optionally filtered by category. */
export async function getActiveElements(category?: string | null): Promise<Element[]> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    let elements = getMockElements();
    if (category) elements = elements.filter((e) => e.categorie === category);
    return elements;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  let query = supabase.from('elements').select('*').eq('actif', true);
  if (category) query = query.eq('categorie', category);
  const { data, error } = await query;
  if (error) throw new Error(`DB error fetching elements: ${error.message}`);
  return (data as Element[]) || [];
}

/** Fetch specific elements by IDs. */
export async function getElementsByIds(ids: string[]): Promise<Element[]> {
  if (isMockMode()) {
    const { getMockElement } = await import('@/lib/mockData');
    return ids.map((id) => getMockElement(id)).filter(Boolean) as Element[];
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data, error } = await supabase.from('elements').select('*').in('id', ids);
  if (error) throw new Error(`DB error fetching elements by ids: ${error.message}`);
  return (data as unknown as Element[]) || [];
}

/** Fetch all elements (including inactive) for admin. */
export async function getAllElements(): Promise<Element[]> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    return getMockElements();
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data, error } = await supabase.from('elements').select('*').order('elo_global', { ascending: false });
  if (error) throw new Error(`DB error fetching all elements: ${error.message}`);
  return (data as Element[]) || [];
}

/**
 * Fetch all elements enriched with per-segment participation counts
 * derived from the votes table (admin dashboard view).
 */
export async function getAllElementsEnriched(): Promise<Element[]> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    return getMockElements();
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  const [{ data: elements, error }, { data: votesRaw }] = await Promise.all([
    supabase.from('elements').select('*').order('elo_global', { ascending: false }),
    supabase.from('votes').select('element_gagnant_id, element_perdant_id, sexe_votant, age_votant'),
  ]);

  if (error) throw new Error(`DB error fetching elements: ${error.message}`);

  // Build participation maps from votes
  const initEntry = () => ({
    total: 0, homme: 0, femme: 0, autre: 0,
    '16_18': 0, '19_22': 0, '23_26': 0, '27plus': 0,
  });
  type PartEntry = ReturnType<typeof initEntry>;
  const partMap: Record<string, PartEntry> = {};

  const votes = (votesRaw || []) as {
    element_gagnant_id: string; element_perdant_id: string;
    sexe_votant: string | null; age_votant: string | null;
  }[];

  for (const v of votes) {
    for (const eid of [v.element_gagnant_id, v.element_perdant_id]) {
      if (!partMap[eid]) partMap[eid] = initEntry();
      const p = partMap[eid];
      p.total += 1;
      if (v.sexe_votant === 'homme') p.homme += 1;
      else if (v.sexe_votant === 'femme') p.femme += 1;
      else p.autre += 1;
      const ageKey = (v.age_votant || '').replace(/-/g, '_').replace('+', 'plus') as keyof PartEntry;
      if (ageKey && ageKey in p) (p[ageKey] as number) += 1;
    }
  }

  return (elements || []).map((e: Record<string, unknown>) => {
    const p = partMap[e.id as string] || initEntry();
    return {
      ...e,
      nb_participations: p.total,
      nb_participations_homme: p.homme,
      nb_participations_femme: p.femme,
      nb_participations_autre: p.autre,
      nb_participations_16_18: p['16_18'],
      nb_participations_19_22: p['19_22'],
      nb_participations_23_26: p['23_26'],
      nb_participations_27plus: p['27plus'],
    } as Element;
  });
}

// ---------------------------------------------------------------------------
// Write operations
// ---------------------------------------------------------------------------

/** Update fields on an element by ID. Returns the updated element. */
export async function updateElement(id: string, updates: Partial<Element>): Promise<Element | null> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    const elements = getMockElements();
    const el = elements.find((e) => e.id === id);
    if (!el) return null;
    Object.assign(el, updates, { updated_at: new Date().toISOString() });
    return el;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const { typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data, error } = await typedUpdate(supabase, 'elements', {
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw new Error(`DB error updating element ${id}: ${error.message}`);
  return data as unknown as Element;
}

/** Create a new element. */
export async function createElement(data: { texte: string; categorie: string; niveau_provocation: number }): Promise<Element> {
  if (isMockMode()) {
    const newElement = {
      id: `mock-${Date.now()}`,
      texte: data.texte,
      categorie: data.categorie as Element['categorie'],
      niveau_provocation: data.niveau_provocation as Element['niveau_provocation'],
      actif: true,
      elo_global: 1000, elo_homme: 1000, elo_femme: 1000, elo_nonbinaire: 1000, elo_autre: 1000,
      elo_16_18: 1000, elo_19_22: 1000, elo_23_26: 1000, elo_27plus: 1000,
      nb_participations: 0, nb_participations_homme: 0, nb_participations_femme: 0, nb_participations_autre: 0,
      nb_participations_16_18: 0, nb_participations_19_22: 0, nb_participations_23_26: 0, nb_participations_27plus: 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const { getMockElements } = await import('@/lib/mockData');
    getMockElements().push(newElement);
    return newElement;
  }

  const { createServerClient, typedInsert } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data: inserted, error } = await typedInsert(supabase, 'elements', {
    texte: data.texte,
    categorie: data.categorie,
    niveau_provocation: data.niveau_provocation,
    actif: true,
  });
  if (error) throw new Error(`DB error creating element: ${error.message}`);
  return (inserted as unknown as Element[])?.[0] ?? ({} as Element);
}

/** Soft-delete an element by setting actif = false. */
export async function deleteElement(id: string): Promise<void> {
  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');
    const elements = getMockElements();
    const el = elements.find((e) => e.id === id);
    if (el) {
      el.actif = false;
      el.updated_at = new Date().toISOString();
    }
    return;
  }

  const { createServerClient } = await import('@/lib/supabase');
  const { typedUpdate } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { error } = await typedUpdate(supabase, 'elements', {
    actif: false,
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw new Error(`DB error deleting element ${id}: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Starred pairs (for duel algorithm)
// ---------------------------------------------------------------------------

/** Fetch starred duel pairs (high-star feedback). */
export async function getStarredPairs(): Promise<{ element_a_id: string; element_b_id: string; stars_count: number }[] | undefined> {
  if (isMockMode()) return undefined;

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();
  const { data } = await supabase
    .from('duel_feedback')
    .select('element_a_id, element_b_id, stars_count')
    .gte('stars_count', 50)
    .order('stars_count', { ascending: false })
    .limit(100);
  return data || undefined;
}

// ---------------------------------------------------------------------------
// Rankings
// ---------------------------------------------------------------------------

export type LeaderboardView = 'global' | 'homme' | 'femme' | '16-18' | '19-22' | '23-26' | '27+';

type LeaderboardSortField =
  | 'elo_global'
  | 'elo_homme'
  | 'elo_femme'
  | 'elo_16_18'
  | 'elo_19_22'
  | 'elo_23_26'
  | 'elo_27plus';

const LEADERBOARD_SORT_FIELDS: Record<LeaderboardView, LeaderboardSortField> = {
  global: 'elo_global',
  homme: 'elo_homme',
  femme: 'elo_femme',
  '16-18': 'elo_16_18',
  '19-22': 'elo_19_22',
  '23-26': 'elo_23_26',
  '27+': 'elo_27plus',
};

export type LeaderboardOptions = {
  sort?: 'asc' | 'desc' | string;
  limit?: number;
  offset?: number;
  category?: string | null;
  view?: LeaderboardView;
  search?: string | null;
};

type LeaderboardRow = {
  id: string;
  texte: string;
  categorie: string;
  elo_global: number;
  elo_homme: number;
  elo_femme: number;
  elo_16_18: number;
  elo_19_22: number;
  elo_23_26: number;
  elo_27plus: number;
  nb_participations: number;
};

export type LeaderboardResult = {
  elements: LeaderboardRow[];
  total: number;
};

function getSortValue(element: Element, view: LeaderboardView): number {
  switch (view) {
    case 'homme':
      return element.elo_homme;
    case 'femme':
      return element.elo_femme;
    case '16-18':
      return element.elo_16_18;
    case '19-22':
      return element.elo_19_22;
    case '23-26':
      return element.elo_23_26;
    case '27+':
      return element.elo_27plus;
    default:
      return element.elo_global;
  }
}

function normalizeSearch(search?: string | null): string | null {
  const normalized = search?.trim().toLowerCase();
  return normalized ? normalized : null;
}

/** Get element rankings for leaderboard. */
export async function getLeaderboard(options: LeaderboardOptions): Promise<LeaderboardResult> {
  const view: LeaderboardView = options.view ?? 'global';
  const sortField = LEADERBOARD_SORT_FIELDS[view];
  const sortAscending = options.sort === 'asc';
  const limit = options.limit && options.limit > 0 ? options.limit : undefined;
  const offset = Math.max(0, options.offset || 0);
  const search = normalizeSearch(options.search);

  if (isMockMode()) {
    const { getMockElements } = await import('@/lib/mockData');

    let elements = getMockElements().filter((e) => e.actif);

    if (options.category) {
      elements = elements.filter((e) => e.categorie === options.category);
    }

    if (search) {
      elements = elements.filter((e) => e.texte.toLowerCase().includes(search));
    }

    elements.sort((a, b) => {
      const left = getSortValue(a, view);
      const right = getSortValue(b, view);
      return sortAscending ? left - right : right - left;
    });

    const total = elements.length;
    const pagedElements = typeof limit === 'number'
      ? elements.slice(offset, offset + limit)
      : elements.slice(offset);

    return {
      elements: pagedElements.map((e) => ({
        id: e.id,
        texte: e.texte,
        categorie: e.categorie,
        elo_global: e.elo_global,
        elo_homme: e.elo_homme,
        elo_femme: e.elo_femme,
        elo_16_18: e.elo_16_18,
        elo_19_22: e.elo_19_22,
        elo_23_26: e.elo_23_26,
        elo_27plus: e.elo_27plus,
        nb_participations: e.nb_participations,
      })),
      total,
    };
  }

  const { createServerClient } = await import('@/lib/supabase');
  const supabase = createServerClient();

  let query = supabase
    .from('elements')
    .select(
      'id, texte, categorie, elo_global, elo_homme, elo_femme, elo_16_18, elo_19_22, elo_23_26, elo_27plus, nb_participations',
      { count: 'exact' },
    )
    .eq('actif', true)
    .order(sortField, { ascending: sortAscending })
    .order('id', { ascending: true });

  if (options.category) {
    query = query.eq('categorie', options.category);
  }

  if (search) {
    query = query.ilike('texte', `%${search}%`);
  }

  if (typeof limit === 'number') {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(`DB error fetching leaderboard: ${error.message}`);

  return {
    elements: (data as LeaderboardRow[]) || [],
    total: count ?? (data?.length || 0),
  };
}
