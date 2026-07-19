'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { AdminNav } from '@/components/admin/AdminNav';
import { CATEGORIES_LIST, TAGS_LIST } from '@/config/categories';
import { Categorie, Element } from '@/types';

type AdminElement = Element & { is_starred?: boolean };
type StatusFilter = 'all' | 'active' | 'inactive';
type StarFilter = 'all' | 'starred' | 'unstarred';
type SortKey =
  | 'elo_global'
  | 'nb_participations'
  | 'updated_at'
  | 'created_at'
  | 'texte'
  | 'categorie'
  | 'niveau_provocation';
type SortDirection = 'asc' | 'desc';
type TagMatchMode = 'any' | 'all';
type BulkScope = 'selected' | 'filtered';
type Feedback = { type: 'success' | 'error'; text: string };

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;
const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'elo_global', label: 'ELO global' },
  { key: 'nb_participations', label: 'Participations' },
  { key: 'updated_at', label: 'Derniere modification' },
  { key: 'created_at', label: 'Date de creation' },
  { key: 'texte', label: 'Texte (A-Z)' },
  { key: 'categorie', label: 'Categorie' },
  { key: 'niveau_provocation', label: 'Niveau de provocation' },
];
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function getErrorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getSortValue(element: AdminElement, sortKey: SortKey): number | string {
  switch (sortKey) {
    case 'texte':
      return element.texte.toLowerCase();
    case 'categorie':
      return element.categorie;
    case 'niveau_provocation':
      return element.niveau_provocation;
    case 'nb_participations':
      return element.nb_participations;
    case 'updated_at':
      return Date.parse(element.updated_at) || 0;
    case 'created_at':
      return Date.parse(element.created_at) || 0;
    case 'elo_global':
    default:
      return element.elo_global;
  }
}

function sortElements(elements: AdminElement[], sortKey: SortKey, direction: SortDirection): AdminElement[] {
  const directionFactor = direction === 'asc' ? 1 : -1;

  return [...elements].sort((left, right) => {
    const leftValue = getSortValue(left, sortKey);
    const rightValue = getSortValue(right, sortKey);

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      const comparison = leftValue.localeCompare(rightValue, 'fr', { sensitivity: 'base' });
      if (comparison !== 0) return comparison * directionFactor;
    } else if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      const comparison = leftValue - rightValue;
      if (comparison !== 0) return comparison * directionFactor;
    }

    return right.elo_global - left.elo_global;
  });
}

function formatDate(dateValue: string): string {
  const parsed = Date.parse(dateValue);
  if (!Number.isFinite(parsed)) return '-';
  return DATE_TIME_FORMATTER.format(new Date(parsed));
}

export default function AdminElementsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [elements, setElements] = useState<AdminElement[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [starFilter, setStarFilter] = useState<StarFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMatchMode, setTagMatchMode] = useState<TagMatchMode>('any');
  const [withoutTagsOnly, setWithoutTagsOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('elo_global');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkScope, setBulkScope] = useState<BulkScope>('selected');
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<AdminElement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryMap = useMemo(() => {
    return new Map(CATEGORIES_LIST.map((category) => [category.id, category]));
  }, []);

  const tagMap = useMemo(() => {
    return new Map(TAGS_LIST.map((tag) => [tag.id, tag]));
  }, []);

  const fetchElements = useCallback(async (token: string, silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/admin/elements', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setElements((data.data.elements || []) as AdminElement[]);
      } else {
        setFeedback({ type: 'error', text: data.error?.message || 'Erreur lors du chargement des elements.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur reseau lors du chargement des elements.' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    void fetchElements(token);
  }, [router, fetchElements]);

  useEffect(() => {
    const existingIds = new Set(elements.map((element) => element.id));
    setSelectedIds((prev) => prev.filter((id) => existingIds.has(id)));
  }, [elements]);

  const patchElement = useCallback(async (id: string, updates: Partial<AdminElement>) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return null;
    }

    const response = await fetch(`/api/admin/elements/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (response.status === 401) {
      sessionStorage.removeItem('adminToken');
      router.push('/admin');
      return null;
    }

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error?.message || 'Erreur lors de la mise a jour.');
    }

    const result = await response.json().catch(() => null);
    return (result?.data?.element ?? null) as AdminElement | null;
  }, [router]);

  const toggleElement = async (element: AdminElement) => {
    const nextValue = !element.actif;

    try {
      const updated = await patchElement(element.id, { actif: nextValue });
      setElements((prev) => prev.map((entry) => {
        if (entry.id !== element.id) return entry;
        if (updated) return { ...entry, ...updated };
        return { ...entry, actif: nextValue, updated_at: new Date().toISOString() };
      }));
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorText(error, 'Impossible de modifier le statut.') });
    }
  };

  const toggleStar = async (element: AdminElement) => {
    const nextValue = !element.is_starred;

    try {
      const updated = await patchElement(element.id, { is_starred: nextValue });
      setElements((prev) => prev.map((entry) => {
        if (entry.id !== element.id) return entry;
        if (updated) return { ...entry, ...updated };
        return { ...entry, is_starred: nextValue, updated_at: new Date().toISOString() };
      }));
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorText(error, 'Impossible de modifier les favoris.') });
    }
  };

  const softDeleteElement = async (id: string) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const response = await fetch(`/api/admin/elements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        setFeedback({
          type: 'error',
          text: errorPayload?.error?.message || 'Erreur lors de la suppression.',
        });
        return;
      }

      setElements((prev) => prev.map((element) => (
        element.id === id
          ? { ...element, actif: false, updated_at: new Date().toISOString() }
          : element
      )));
      setDeletingId(null);
      setFeedback({ type: 'success', text: 'Element desactive avec succes.' });
    } catch {
      setFeedback({ type: 'error', text: 'Erreur reseau pendant la suppression.' });
    }
  };

  const refreshElements = async () => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    void fetchElements(token, true);
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const baseFilteredElements = useMemo(() => {
    return elements.filter((element) => {
      if (statusFilter === 'active' && !element.actif) return false;
      if (statusFilter === 'inactive' && element.actif) return false;
      if (starFilter === 'starred' && !element.is_starred) return false;
      if (starFilter === 'unstarred' && element.is_starred) return false;
      if (showOnlySelected && !selectedIdSet.has(element.id)) return false;

      if (!normalizedSearch) return true;

      const categoryText = categoryMap.get(element.categorie)?.labelFr?.toLowerCase() || element.categorie;
      const tagsText = (element.tags || [])
        .map((tagId) => tagMap.get(tagId)?.label || tagId)
        .join(' ')
        .toLowerCase();

      return (
        element.texte.toLowerCase().includes(normalizedSearch) ||
        element.id.toLowerCase().includes(normalizedSearch) ||
        categoryText.includes(normalizedSearch) ||
        tagsText.includes(normalizedSearch)
      );
    });
  }, [
    elements,
    statusFilter,
    starFilter,
    showOnlySelected,
    selectedIdSet,
    normalizedSearch,
    categoryMap,
    tagMap,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: baseFilteredElements.length };
    for (const category of CATEGORIES_LIST) {
      counts[category.id] = 0;
    }
    for (const element of baseFilteredElements) {
      counts[element.categorie] = (counts[element.categorie] || 0) + 1;
    }
    return counts;
  }, [baseFilteredElements]);

  const categoryScopedElements = useMemo(() => {
    if (categoryFilter === 'all') return baseFilteredElements;
    return baseFilteredElements.filter((element) => element.categorie === categoryFilter);
  }, [baseFilteredElements, categoryFilter]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of TAGS_LIST) {
      counts[tag.id] = 0;
    }

    let untagged = 0;
    for (const element of categoryScopedElements) {
      const tags = element.tags || [];
      if (tags.length === 0) {
        untagged += 1;
      }
      for (const tagId of tags) {
        counts[tagId] = (counts[tagId] || 0) + 1;
      }
    }

    return { counts, untagged };
  }, [categoryScopedElements]);

  const tagFilteredElements = useMemo(() => {
    return categoryScopedElements.filter((element) => {
      const tags = element.tags || [];

      if (withoutTagsOnly && tags.length > 0) {
        return false;
      }

      if (selectedTags.length === 0) {
        return true;
      }

      if (tags.length === 0) {
        return false;
      }

      if (tagMatchMode === 'all') {
        return selectedTags.every((tagId) => tags.includes(tagId));
      }

      return selectedTags.some((tagId) => tags.includes(tagId));
    });
  }, [categoryScopedElements, selectedTags, tagMatchMode, withoutTagsOnly]);

  const sortedElements = useMemo(() => {
    return sortElements(tagFilteredElements, sortKey, sortDirection);
  }, [tagFilteredElements, sortKey, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    starFilter,
    categoryFilter,
    normalizedSearch,
    selectedTags,
    tagMatchMode,
    withoutTagsOnly,
    showOnlySelected,
    pageSize,
  ]);

  const totalFiltered = sortedElements.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStartIndex = (currentPage - 1) * pageSize;
  const paginatedElements = useMemo(() => {
    return sortedElements.slice(pageStartIndex, pageStartIndex + pageSize);
  }, [sortedElements, pageStartIndex, pageSize]);

  const visibleIds = useMemo(() => {
    return paginatedElements.map((element) => element.id);
  }, [paginatedElements]);

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIdSet.has(id));

  const bulkTargetIds = bulkScope === 'selected'
    ? selectedIds
    : sortedElements.map((element) => element.id);

  const bulkPatch = useCallback(async (
    ids: string[],
    updates: Partial<AdminElement>,
    label: string,
  ) => {
    if (ids.length === 0) {
      setFeedback({ type: 'error', text: 'Aucun element cible pour cette action.' });
      return;
    }

    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    setIsBulkUpdating(true);

    try {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const response = await fetch(`/api/admin/elements/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (response.status === 401) {
            throw new Error('UNAUTHORIZED');
          }

          if (!response.ok) {
            throw new Error(`HTTP_${response.status}`);
          }

          const payload = await response.json().catch(() => null);
          return { id, element: payload?.data?.element as AdminElement | undefined };
        }),
      );

      let unauthorized = false;
      let successCount = 0;
      const updatedById = new Map<string, AdminElement>();

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successCount += 1;
          if (result.value.element) {
            updatedById.set(result.value.id, result.value.element);
          }
          continue;
        }

        if (
          result.reason instanceof Error &&
          result.reason.message === 'UNAUTHORIZED'
        ) {
          unauthorized = true;
        }
      }

      if (unauthorized) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      if (successCount > 0) {
        const idsSet = new Set(ids);
        setElements((prev) => prev.map((element) => {
          if (!idsSet.has(element.id)) return element;

          const updated = updatedById.get(element.id);
          if (updated) return { ...element, ...updated };

          return { ...element, ...updates, updated_at: new Date().toISOString() };
        }));
      }

      const failedCount = ids.length - successCount;
      if (failedCount > 0) {
        setFeedback({
          type: 'error',
          text: `${successCount}/${ids.length} elements mis a jour (${failedCount} echecs) pour: ${label}.`,
        });
      } else {
        setFeedback({
          type: 'success',
          text: `${successCount} elements mis a jour pour: ${label}.`,
        });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur lors de la mise a jour en lot.' });
    } finally {
      setIsBulkUpdating(false);
    }
  }, [router]);

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags((prev) => (
      prev.includes(tagId)
        ? prev.filter((entry) => entry !== tagId)
        : [...prev, tagId]
    ));
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setStarFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setSelectedTags([]);
    setTagMatchMode('any');
    setWithoutTagsOnly(false);
    setShowOnlySelected(false);
    setCurrentPage(1);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (
      prev.includes(id)
        ? prev.filter((entry) => entry !== id)
        : [...prev, id]
    ));
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const visibleSet = new Set(visibleIds);
        return prev.filter((id) => !visibleSet.has(id));
      }

      const updated = new Set(prev);
      for (const id of visibleIds) {
        updated.add(id);
      }
      return Array.from(updated);
    });
  };

  const totalActive = elements.filter((element) => element.actif).length;
  const totalStarred = elements.filter((element) => element.is_starred).length;
  const totalWithoutTags = elements.filter((element) => (element.tags || []).length === 0).length;
  const totalEloAverage = elements.length
    ? Math.round(elements.reduce((sum, element) => sum + element.elo_global, 0) / elements.length)
    : 0;

  const selectedCount = selectedIds.length;
  const pageStartDisplay = totalFiltered === 0 ? 0 : pageStartIndex + 1;
  const pageEndDisplay = Math.min(pageStartIndex + pageSize, totalFiltered);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);

    const pages: number[] = [];
    for (let page = Math.max(1, end - windowSize + 1); page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement des elements..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />

      <div className="p-4 sm:p-6 overflow-y-auto pb-24">
        <header className="max-w-350 mx-auto mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
                Gestion des <span className="text-[#DC2626]">elements</span>
              </h1>
              <p className="text-[#A3A3A3] mt-1">
                {totalFiltered} resultat(s) filtre(s) sur {elements.length} element(s)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={refreshElements}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                + Ajouter un element
              </Button>
            </div>
          </div>
        </header>

        <section className="max-w-350 mx-auto mb-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
          <SummaryCard label="Total" value={elements.length} accent="text-[#F5F5F5]" />
          <SummaryCard label="Actifs" value={totalActive} accent="text-[#22C55E]" />
          <SummaryCard label="Inactifs" value={elements.length - totalActive} accent="text-[#F59E0B]" />
          <SummaryCard label="Favoris" value={totalStarred} accent="text-[#FCD34D]" />
          <SummaryCard label="Sans tags" value={totalWithoutTags} accent="text-[#60A5FA]" />
          <SummaryCard label="ELO moyen" value={totalEloAverage} accent="text-[#DC2626]" />
        </section>

        {feedback && (
          <div className="max-w-350 mx-auto mb-6">
            <div
              className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-4 ${
                feedback.type === 'error'
                  ? 'bg-[#991B1B]/20 border-[#DC2626]/50 text-[#FCA5A5]'
                  : 'bg-[#064E3B]/30 border-[#059669]/50 text-[#6EE7B7]'
              }`}
            >
              <p>{feedback.text}</p>
              <button
                onClick={() => setFeedback(null)}
                className="text-sm opacity-80 hover:opacity-100"
                aria-label="Fermer le message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <section className="max-w-350 mx-auto mb-6 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            <div className="xl:col-span-5">
              <input
                type="text"
                placeholder="Recherche: texte, ID, categorie, tag..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full px-4 py-2.5 bg-[#0D0D0D] border border-[#333] rounded-xl text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              />
            </div>

            <div className="xl:col-span-3 flex gap-2">
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="flex-1 px-3 py-2.5 bg-[#0D0D0D] border border-[#333] rounded-xl text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    Tri: {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-2.5 rounded-xl border border-[#333] bg-[#0D0D0D] text-[#F5F5F5] hover:border-[#DC2626] transition-colors"
                title="Inverser le sens du tri"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="xl:col-span-2">
              <select
                value={String(pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="w-full px-3 py-2.5 bg-[#0D0D0D] border border-[#333] rounded-xl text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2 flex gap-2">
              <Button
                variant={showOnlySelected ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setShowOnlySelected((prev) => !prev)}
              >
                Selection ({selectedCount})
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" onClick={clearFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
              Tous ({elements.length})
            </FilterButton>
            <FilterButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
              Actifs ({totalActive})
            </FilterButton>
            <FilterButton active={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
              Inactifs ({elements.length - totalActive})
            </FilterButton>

            <div className="mx-1 h-8 w-px bg-[#333]" />

            <FilterButton active={starFilter === 'all'} onClick={() => setStarFilter('all')}>
              Favoris: tous
            </FilterButton>
            <FilterButton active={starFilter === 'starred'} onClick={() => setStarFilter('starred')}>
              Favoris ({totalStarred})
            </FilterButton>
            <FilterButton active={starFilter === 'unstarred'} onClick={() => setStarFilter('unstarred')}>
              Non favoris ({elements.length - totalStarred})
            </FilterButton>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-[#737373] mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <FilterButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
                Toutes ({categoryCounts.all || 0})
              </FilterButton>

              {CATEGORIES_LIST.map((category) => (
                <FilterButton
                  key={category.id}
                  active={categoryFilter === category.id}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.emoji} {category.labelFr} ({categoryCounts[category.id] || 0})
                </FilterButton>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-xs uppercase tracking-wider text-[#737373]">Tags</p>

              <select
                value={tagMatchMode}
                onChange={(event) => setTagMatchMode(event.target.value as TagMatchMode)}
                className="px-2 py-1 text-xs bg-[#0D0D0D] border border-[#333] rounded-lg text-[#A3A3A3]"
              >
                <option value="any">Match: au moins 1 tag</option>
                <option value="all">Match: tous les tags</option>
              </select>

              <button
                onClick={() => setWithoutTagsOnly((prev) => !prev)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                  withoutTagsOnly
                    ? 'bg-[#1E3A8A]/30 border-[#60A5FA] text-[#BFDBFE]'
                    : 'bg-[#0D0D0D] border-[#333] text-[#A3A3A3] hover:border-[#52525B]'
                }`}
              >
                Sans tags uniquement ({tagCounts.untagged})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {TAGS_LIST.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                      active
                        ? 'bg-[#DC2626]/20 border-[#DC2626]/60 text-[#FCA5A5]'
                        : 'bg-[#1A1A1A] border-[#333] text-[#A3A3A3] hover:border-[#52525B] hover:text-[#F5F5F5]'
                    }`}
                    title={tag.description}
                  >
                    {tag.emoji} {tag.label} ({tagCounts.counts[tag.id] || 0})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#333] bg-[#0D0D0D] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-[#A3A3A3]">
                Selection: <span className="text-[#F5F5F5] font-semibold">{selectedCount}</span> element(s)
                {' · '}Cible en lot: <span className="text-[#F5F5F5] font-semibold">{bulkTargetIds.length}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleVisibleSelection}
                  className="px-3 py-1.5 rounded-lg border border-[#333] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#52525B] text-sm"
                >
                  {allVisibleSelected ? 'Deselectionner la page' : 'Selectionner la page'}
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-lg border border-[#333] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#52525B] text-sm"
                >
                  Vider selection
                </button>

                <select
                  value={bulkScope}
                  onChange={(event) => setBulkScope(event.target.value as BulkScope)}
                  className="px-2 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] text-[#F5F5F5] text-sm"
                >
                  <option value="selected">Actions sur la selection</option>
                  <option value="filtered">Actions sur tout le filtre</option>
                </select>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBulkUpdating || bulkTargetIds.length === 0}
                  onClick={() => void bulkPatch(bulkTargetIds, { actif: true }, 'Activer')}
                >
                  Activer
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBulkUpdating || bulkTargetIds.length === 0}
                  onClick={() => void bulkPatch(bulkTargetIds, { actif: false }, 'Desactiver')}
                >
                  Desactiver
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBulkUpdating || bulkTargetIds.length === 0}
                  onClick={() => void bulkPatch(bulkTargetIds, { is_starred: true }, 'Mettre en favoris')}
                >
                  Favoris ON
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isBulkUpdating || bulkTargetIds.length === 0}
                  onClick={() => void bulkPatch(bulkTargetIds, { is_starred: false }, 'Retirer des favoris')}
                >
                  Favoris OFF
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-350 mx-auto">
          <div className="hidden md:block bg-[#1A1A1A] border border-[#333] rounded-2xl overflow-hidden">
            <div className="max-h-[62vh] overflow-y-auto overflow-x-auto">
              <table className="w-full min-w-287.5">
                <thead className="sticky top-0 bg-[#1A1A1A] z-10">
                  <tr className="border-b border-[#333]">
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-[#737373] w-16">#</th>
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-[#737373] w-12">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleVisibleSelection}
                        className="accent-[#DC2626]"
                        aria-label="Selectionner les elements de la page"
                      />
                    </th>
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-[#737373]">Texte</th>
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-[#737373] w-40">Categorie</th>
                    <th className="p-3 text-left text-xs uppercase tracking-wide text-[#737373] w-56">Tags</th>
                    <th className="p-3 text-center text-xs uppercase tracking-wide text-[#737373] w-24">ELO</th>
                    <th className="p-3 text-center text-xs uppercase tracking-wide text-[#737373] w-28">Votes</th>
                    <th className="p-3 text-center text-xs uppercase tracking-wide text-[#737373] w-28">Provoc.</th>
                    <th className="p-3 text-center text-xs uppercase tracking-wide text-[#737373] w-36">MAJ</th>
                    <th className="p-3 text-center text-xs uppercase tracking-wide text-[#737373] w-24">Actif</th>
                    <th className="p-3 text-right text-xs uppercase tracking-wide text-[#737373] w-36">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedElements.map((element, index) => {
                    const isSelected = selectedIdSet.has(element.id);
                    const tags = element.tags || [];
                    return (
                      <tr
                        key={element.id}
                        className={`border-b border-[#2A2A2A] ${
                          !element.actif ? 'opacity-55' : ''
                        } ${isSelected ? 'bg-[#7F1D1D]/20' : ''}`}
                      >
                        <td className="p-3 text-[#737373] text-sm font-mono">
                          {pageStartIndex + index + 1}
                        </td>

                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(element.id)}
                            className="accent-[#DC2626]"
                            aria-label={`Selectionner l'element ${element.id}`}
                          />
                        </td>

                        <td className="p-3 align-top">
                          <div className="flex items-start gap-2">
                            {element.is_starred && (
                              <span className="text-[#FCD34D] mt-0.5">⭐</span>
                            )}
                            <div>
                              <p className="text-[#F5F5F5] leading-snug">{element.texte}</p>
                              <p className="text-[11px] text-[#737373] mt-1 font-mono">{element.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 align-top">
                          <CategoryBadge categorie={element.categorie} variant="pill" />
                        </td>

                        <td className="p-3 align-top">
                          {tags.length === 0 ? (
                            <span className="text-xs text-[#737373]">Aucun tag</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {tags.map((tagId) => {
                                const tag = tagMap.get(tagId);
                                return (
                                  <span
                                    key={`${element.id}-${tagId}`}
                                    className="px-1.5 py-0.5 rounded-md bg-[#27272A] text-[#A1A1AA] text-[10px] font-semibold"
                                  >
                                    {tag ? `${tag.emoji} ${tag.label}` : tagId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-center text-[#F5F5F5] font-mono">
                          {Math.round(element.elo_global)}
                        </td>

                        <td className="p-3 text-center text-[#A3A3A3] font-mono">
                          {element.nb_participations}
                        </td>

                        <td className="p-3 text-center">
                          <span className="px-2 py-1 rounded-lg bg-[#0D0D0D] border border-[#333] text-[#A3A3A3] text-xs">
                            N{element.niveau_provocation}
                          </span>
                        </td>

                        <td className="p-3 text-center text-[#A3A3A3] text-xs">
                          {formatDate(element.updated_at)}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => void toggleElement(element)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              element.actif ? 'bg-[#059669]' : 'bg-[#2A2A2A]'
                            }`}
                            title={element.actif ? 'Desactiver' : 'Activer'}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                element.actif ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => void toggleStar(element)}
                              className={`transition-colors text-lg ${
                                element.is_starred ? 'text-[#FCD34D]' : 'text-[#737373] hover:text-[#FCD34D]'
                              }`}
                              title={element.is_starred ? 'Retirer des favoris' : 'Mettre en favoris'}
                            >
                              {element.is_starred ? '⭐' : '☆'}
                            </button>
                            <button
                              onClick={() => setEditingElement(element)}
                              className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors text-sm"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setDeletingId(element.id)}
                              className="text-[#737373] hover:text-[#DC2626] transition-colors text-sm"
                              title="Desactiver (soft delete)"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {paginatedElements.length === 0 && (
              <div className="p-8 text-center text-[#737373]">
                Aucun element trouve avec ce tri.
              </div>
            )}
          </div>

          <div className="md:hidden space-y-3">
            {paginatedElements.map((element) => {
              const tags = element.tags || [];
              const isSelected = selectedIdSet.has(element.id);
              return (
                <div
                  key={element.id}
                  className={`bg-[#1A1A1A] border rounded-xl p-4 ${
                    isSelected ? 'border-[#DC2626]/50' : 'border-[#333]'
                  } ${!element.actif ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(element.id)}
                      className="mt-1 accent-[#DC2626]"
                    />
                    <div className="flex-1">
                      <p className="text-[#F5F5F5] text-sm leading-snug">{element.texte}</p>
                      <p className="text-[11px] text-[#737373] font-mono mt-1">{element.id}</p>
                    </div>
                    <button
                      onClick={() => void toggleElement(element)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        element.actif ? 'bg-[#059669]' : 'bg-[#2A2A2A]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          element.actif ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <CategoryBadge categorie={element.categorie} variant="pill" />
                    <span className="text-xs text-[#A3A3A3] font-mono">
                      ELO {Math.round(element.elo_global)} · V {element.nb_participations}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.length === 0 ? (
                      <span className="text-xs text-[#737373]">Aucun tag</span>
                    ) : (
                      tags.map((tagId) => {
                        const tag = tagMap.get(tagId);
                        return (
                          <span
                            key={`${element.id}-${tagId}`}
                            className="px-1.5 py-0.5 rounded-md bg-[#27272A] text-[#A1A1AA] text-[10px] font-semibold"
                          >
                            {tag ? `${tag.emoji} ${tag.label}` : tagId}
                          </span>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => void toggleStar(element)}
                      className={`transition-colors ${
                        element.is_starred ? 'text-[#FCD34D]' : 'text-[#737373]'
                      }`}
                    >
                      {element.is_starred ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={() => setEditingElement(element)}
                      className="text-[#A3A3A3] text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingId(element.id)}
                      className="text-[#737373] text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            {paginatedElements.length === 0 && (
              <div className="p-8 text-center text-[#737373] bg-[#1A1A1A] border border-[#333] rounded-xl">
                Aucun element trouve avec ce tri.
              </div>
            )}
          </div>
        </section>

        <section className="max-w-350 mx-auto mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-[#737373]">
            Affichage {pageStartDisplay}-{pageEndDisplay} sur {totalFiltered}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
            >
              Precedent
            </Button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#1A1A1A] border border-[#333] text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                {page}
              </button>
            ))}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
            >
              Suivant
            </Button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#1A1A1A] border border-[#DC2626]/50 rounded-xl p-6 w-full max-w-sm"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">Desactiver cet element ?</h3>
              <p className="text-[#A3A3A3] text-sm mb-1">
                {elements.find((element) => element.id === deletingId)?.texte}
              </p>
              <p className="text-[#737373] text-xs mb-6">
                Soft delete: l&apos;element devient inactif, ses historiques ELO sont conserves.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setDeletingId(null)}>
                  Annuler
                </Button>
                <button
                  onClick={() => deletingId && void softDeleteElement(deletingId)}
                  className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#EF4444] transition-colors font-medium"
                >
                  Desactiver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <ElementModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={async (data) => {
              const token = sessionStorage.getItem('adminToken');
              if (!token) {
                router.push('/admin');
                return;
              }

              try {
                const response = await fetch('/api/admin/elements', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(data),
                });

                if (response.status === 401) {
                  sessionStorage.removeItem('adminToken');
                  router.push('/admin');
                  return;
                }

                if (!response.ok) {
                  const payload = await response.json().catch(() => null);
                  setFeedback({
                    type: 'error',
                    text: payload?.error?.message || 'Erreur lors de la creation.',
                  });
                  return;
                }

                const result = await response.json();
                setElements((prev) => [result.data.element as AdminElement, ...prev]);
                setIsAddModalOpen(false);
                setFeedback({ type: 'success', text: 'Element cree avec succes.' });
              } catch {
                setFeedback({ type: 'error', text: 'Erreur reseau lors de la creation.' });
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingElement && (
          <ElementModal
            element={editingElement}
            onClose={() => setEditingElement(null)}
            onSave={async (data) => {
              const token = sessionStorage.getItem('adminToken');
              if (!token || !editingElement) {
                router.push('/admin');
                return;
              }

              try {
                const response = await fetch(`/api/admin/elements/${editingElement.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(data),
                });

                if (response.status === 401) {
                  sessionStorage.removeItem('adminToken');
                  router.push('/admin');
                  return;
                }

                if (!response.ok) {
                  const payload = await response.json().catch(() => null);
                  setFeedback({
                    type: 'error',
                    text: payload?.error?.message || 'Erreur lors de la mise a jour.',
                  });
                  return;
                }

                const result = await response.json().catch(() => null);
                const updated = (result?.data?.element ?? data) as Partial<AdminElement>;

                setElements((prev) => prev.map((element) => (
                  element.id === editingElement.id
                    ? { ...element, ...updated, updated_at: new Date().toISOString() }
                    : element
                )));
                setEditingElement(null);
                setFeedback({ type: 'success', text: 'Element modifie avec succes.' });
              } catch {
                setFeedback({ type: 'error', text: 'Erreur reseau lors de la mise a jour.' });
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-wide text-[#737373]">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
        active
          ? 'bg-[#DC2626] border-[#DC2626] text-white'
          : 'bg-[#1A1A1A] border-[#333] text-[#A3A3A3] hover:text-[#F5F5F5] hover:border-[#52525B]'
      }`}
    >
      {children}
    </button>
  );
}

// Element Modal Component
function ElementModal({
  element,
  onClose,
  onSave,
}: {
  element?: Element;
  onClose: () => void;
  onSave: (data: Partial<Element>) => Promise<void>;
}) {
  const [texte, setTexte] = useState(element?.texte || '');
  const [categorie, setCategorie] = useState<Categorie>(element?.categorie || 'quotidien');
  const [niveauProvocation, setNiveauProvocation] = useState<1 | 2 | 3 | 4>(element?.niveau_provocation || 2);
  const [tags, setTags] = useState<string[]>(element?.tags || []);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tagId: string) => {
    setTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ texte, categorie, niveau_provocation: niveauProvocation, tags });
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 w-full max-w-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[#F5F5F5] mb-6">
          {element ? 'Modifier l\'élément' : 'Ajouter un élément'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">Texte</label>
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">Catégorie</label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as Categorie)}
              className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            >
              {CATEGORIES_LIST.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.labelFr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">
              Niveau de provocation: {niveauProvocation}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={niveauProvocation}
              onChange={(e) => setNiveauProvocation(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
              className="w-full accent-[#DC2626]"
            />
            <div className="flex justify-between text-xs text-[#737373] mt-1">
              <span>Léger</span>
              <span>Moyen</span>
              <span>Fort</span>
              <span>Extrême</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">
              Tags <span className="text-[#737373] font-normal">(thèmes pour le classement)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS_LIST.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors border ${
                    tags.includes(tag.id)
                      ? 'bg-[#DC2626]/20 border-[#DC2626]/60 text-[#FCA5A5]'
                      : 'bg-[#27272A] border-[#3F3F46] text-[#A1A1AA] hover:border-[#52525B]'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
