'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';

interface OracleSubmission {
  id: string;
  text: string;
  verdict: 'red' | 'green';
  justification?: string;
  gender?: 'homme' | 'femme' | 'autre';
  timestamp: number;
}

function formatGender(gender?: 'homme' | 'femme' | 'autre'): string {
  if (gender === 'homme') return '♂ Homme';
  if (gender === 'femme') return '♀ Femme';
  if (gender === 'autre') return '⚧ Autre';
  return '—';
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export default function AdminOraclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<OracleSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'red' | 'green'>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<OracleSubmission | null>(null);
  const PAGE_SIZE = 30;

  const fetchSubmissions = useCallback(async (token: string, currentPage: number, currentFilter: string, currentSearch: string) => {
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: (currentPage * PAGE_SIZE).toString(),
      });
      if (currentFilter !== 'all') params.set('verdict', currentFilter);
      if (currentSearch.trim()) params.set('search', currentSearch.trim());

      const response = await fetch(`/api/admin/oracle?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur serveur');
      const result = await response.json();
      setSubmissions(result.data?.submissions || []);
      setTotal(result.data?.total || 0);
      setError('');
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchSubmissions(token, page, filter, search);
  }, [router, fetchSubmissions, page, filter, search]);

  const handleFilterChange = (newFilter: 'all' | 'red' | 'green') => {
    setFilter(newFilter);
    setPage(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />
      <div className="p-6">
        {/* Header */}
        <header className="max-w-6xl mx-auto mb-6">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            🔮 <span className="text-purple-400">Oracle</span> — Historique IA
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Toutes les soumissions utilisateur et réponses de l&apos;IA ({total} au total)
          </p>
        </header>

        {/* Error */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              {error}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-4 items-center">
          {/* Filter buttons */}
          <div className="flex gap-2">
            {(['all', 'red', 'green'] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? f === 'red'
                      ? 'bg-red-600 text-white'
                      : f === 'green'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'red' ? '🚩 Red' : '✅ Green'}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
            >
              Rechercher
            </button>
            {(search || searchInput) && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
              >
                Effacer
              </button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-3 py-2 text-gray-400 font-medium w-16">Verdict</th>
                <th className="px-3 py-2 text-gray-400 font-medium w-16">Genre</th>
                <th className="px-3 py-2 text-gray-400 font-medium">Texte soumis</th>
                <th className="px-3 py-2 text-gray-400 font-medium">Justification IA</th>
                <th className="px-3 py-2 text-gray-400 font-medium w-32">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                    Aucune soumission trouvée
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        sub.verdict === 'red'
                          ? 'bg-red-600/30 text-red-300'
                          : 'bg-green-600/30 text-green-300'
                      }`}>
                        {sub.verdict === 'red' ? '🚩 RED' : '✅ GREEN'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-300 text-xs whitespace-nowrap">
                      {formatGender(sub.gender)}
                    </td>
                    <td className="px-3 py-3 text-gray-200 max-w-xs align-top">
                      <p className="text-xs leading-relaxed wrap-break-word">
                        {truncateText(sub.text, 120)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-gray-400 max-w-sm align-top">
                      <p className="text-xs italic leading-relaxed wrap-break-word">
                        {sub.justification ? truncateText(sub.justification, 160) : '—'}
                      </p>
                      {(sub.text.length > 120 || (sub.justification?.length ?? 0) > 160) && (
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="mt-2 text-[11px] text-purple-300 hover:text-purple-200 underline underline-offset-2"
                        >
                          Lire complet
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(sub.timestamp).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="max-w-6xl mx-auto mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page + 1} / {totalPages} ({total} résultats)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded bg-white/5 text-gray-300 text-sm disabled:opacity-30 hover:bg-white/10"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded bg-white/5 text-gray-300 text-sm disabled:opacity-30 hover:bg-white/10"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6">
            <button
              type="button"
              aria-label="Fermer le detail"
              onClick={() => setSelectedSubmission(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#101010] p-5 sm:p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Detail soumission Oracle</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selectedSubmission.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-200 text-sm hover:bg-white/20"
                >
                  Fermer
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                  selectedSubmission.verdict === 'red'
                    ? 'bg-red-600/30 text-red-300'
                    : 'bg-green-600/30 text-green-300'
                }`}>
                  {selectedSubmission.verdict === 'red' ? '🚩 RED' : '✅ GREEN'}
                </span>
                <span className="inline-block px-2.5 py-1 rounded text-xs font-medium bg-white/10 text-gray-200">
                  {formatGender(selectedSubmission.gender)}
                </span>
              </div>

              <section className="mb-4">
                <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Texte utilisateur</h3>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm text-gray-100 whitespace-pre-wrap wrap-break-word leading-relaxed">
                    {selectedSubmission.text}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Justification IA</h3>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap wrap-break-word leading-relaxed italic">
                    {selectedSubmission.justification || '—'}
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
