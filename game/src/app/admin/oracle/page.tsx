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

export default function AdminOraclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<OracleSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'red' | 'green'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
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
    setPage(0);
    // search state change in useEffect triggers fetch
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
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
                    <td className="px-3 py-3 text-gray-300 text-xs">
                      {sub.gender === 'homme' ? '♂️' : sub.gender === 'femme' ? '♀️' : sub.gender === 'autre' ? '🤷' : '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-200 max-w-xs">
                      <span className="line-clamp-2">{sub.text}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 max-w-sm">
                      <span className="line-clamp-3 text-xs italic">
                        {sub.justification || '—'}
                      </span>
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
      </div>
    </div>
  );
}
