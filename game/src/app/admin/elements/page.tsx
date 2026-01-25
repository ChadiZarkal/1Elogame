'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Element, Categorie } from '@/types';
import { CATEGORIES_CONFIG, CATEGORIES_LIST, getCategoryClasses } from '@/config/categories';

export default function AdminElementsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [elements, setElements] = useState<Element[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);

  const fetchElements = useCallback(async (token: string) => {
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
        setElements(data.data.elements);
      } else {
        setError(data.error?.message || 'Erreur lors du chargement');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchElements(token);
  }, [router, fetchElements]);

  const toggleElement = async (element: Element) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/elements/${element.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actif: !element.actif }),
      });

      if (response.ok) {
        setElements(elements.map(e =>
          e.id === element.id ? { ...e, actif: !e.actif } : e
        ));
      }
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const filteredElements = elements
    .filter(e => {
      if (filter === 'active') return e.actif;
      if (filter === 'inactive') return !e.actif;
      return true;
    })
    .filter(e => {
      if (categoryFilter !== 'all') return e.categorie === categoryFilter;
      return true;
    })
    .filter(e =>
      e.texte.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.elo_global - a.elo_global);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6 overflow-y-auto pb-24">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-[#A3A3A3] hover:text-[#F5F5F5] text-sm mb-2 block">
              ← Retour au dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#F5F5F5]">
              Gérer les <span className="text-[#DC2626]">éléments</span>
            </h1>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            + Ajouter un élément
          </Button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <p className="text-[#737373] text-xs">Total</p>
            <p className="text-2xl font-bold text-[#F5F5F5]">{elements.length}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <p className="text-[#737373] text-xs">Actifs</p>
            <p className="text-2xl font-bold text-[#22C55E]">{elements.filter(e => e.actif).length}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <p className="text-[#737373] text-xs">Catégories</p>
            <p className="text-2xl font-bold text-[#DC2626]">{new Set(elements.map(e => e.categorie)).size}</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
            <p className="text-[#737373] text-xs">ELO moyen</p>
            <p className="text-2xl font-bold text-[#60A5FA]">
              {elements.length > 0 ? Math.round(elements.reduce((sum, e) => sum + e.elo_global, 0) / elements.length) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-[#991B1B]/20 border border-[#DC2626]/50 rounded-xl p-4 text-[#FCA5A5]">
            {error}
            <button onClick={() => setError('')} className="ml-4 text-[#DC2626] hover:text-[#F5F5F5]">×</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col gap-4">
          {/* Search + Status filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
            <div className="flex gap-2 flex-wrap">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                Tous ({elements.length})
              </FilterButton>
              <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>
                Actifs ({elements.filter(e => e.actif).length})
              </FilterButton>
              <FilterButton active={filter === 'inactive'} onClick={() => setFilter('inactive')}>
                Inactifs ({elements.filter(e => !e.actif).length})
              </FilterButton>
            </div>
          </div>
          
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            <FilterButton 
              active={categoryFilter === 'all'} 
              onClick={() => setCategoryFilter('all')}
            >
              🏷️ Toutes catégories
            </FilterButton>
            {CATEGORIES_LIST.map((cat) => (
              <FilterButton
                key={cat.id}
                active={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.emoji} {cat.label}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>

      {/* Elements List */}
      <div className="max-w-6xl mx-auto">
        {/* Desktop Table */}
        <div className="hidden md:block bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#1A1A1A] z-10">
                <tr className="border-b border-[#333]">
                  <th className="text-left p-4 text-[#A3A3A3] font-medium">Texte</th>
                  <th className="text-center p-4 text-[#A3A3A3] font-medium w-28">Catégorie</th>
                  <th className="text-center p-4 text-[#A3A3A3] font-medium w-20">ELO</th>
                  <th className="text-center p-4 text-[#A3A3A3] font-medium w-20">Statut</th>
                  <th className="text-right p-4 text-[#A3A3A3] font-medium w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredElements.map((element) => (
                    <motion.tr
                      key={element.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-[#2A2A2A] ${!element.actif ? 'opacity-50' : ''}`}
                    >
                      <td className="p-4 text-[#F5F5F5]">{element.texte}</td>
                      <td className="p-4 text-center">
                        <CategoryBadge category={element.categorie} />
                      </td>
                      <td className="p-4 text-center text-[#F5F5F5] font-mono">
                        {Math.round(element.elo_global)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleElement(element)}
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
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setEditingElement(element)}
                          className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                        >
                          Modifier
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredElements.length === 0 && (
            <div className="p-8 text-center text-[#737373]">
              Aucun élément trouvé
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 max-h-[70vh] overflow-y-auto">
          {filteredElements.map((element) => (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#1A1A1A] border border-[#333] rounded-xl p-4 ${!element.actif ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[#F5F5F5] text-sm flex-1">{element.texte}</p>
                <button
                  onClick={() => toggleElement(element)}
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryBadge category={element.categorie} />
                  <span className="text-[#A3A3A3] text-sm font-mono">ELO: {Math.round(element.elo_global)}</span>
                </div>
                <button
                  onClick={() => setEditingElement(element)}
                  className="text-[#DC2626] text-sm hover:underline"
                >
                  Modifier
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredElements.length === 0 && (
            <div className="p-8 text-center text-[#737373]">
              Aucun élément trouvé
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ElementModal
            onClose={() => setIsAddModalOpen(false)}
            onSave={async (data) => {
              const token = sessionStorage.getItem('adminToken');
              if (!token) return;

              try {
                const response = await fetch('/api/admin/elements', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(data),
                });

                if (response.ok) {
                  const result = await response.json();
                  setElements([...elements, result.data.element]);
                  setIsAddModalOpen(false);
                } else {
                  setError('Erreur lors de la création');
                }
              } catch {
                setError('Erreur de connexion');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingElement && (
          <ElementModal
            element={editingElement}
            onClose={() => setEditingElement(null)}
            onSave={async (data) => {
              const token = sessionStorage.getItem('adminToken');
              if (!token || !editingElement) return;

              try {
                const response = await fetch(`/api/admin/elements/${editingElement.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(data),
                });

                if (response.ok) {
                  setElements(elements.map(e =>
                    e.id === editingElement.id ? { ...e, ...data } : e
                  ));
                  setEditingElement(null);
                } else {
                  setError('Erreur lors de la mise à jour');
                }
              } catch {
                setError('Erreur de connexion');
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer spacer for mobile */}
      <div className="h-8 md:hidden" />
      
      {/* Scroll indicator */}
      {filteredElements.length > 5 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:hidden">
          <div className="bg-[#1A1A1A]/90 backdrop-blur-sm border border-[#333] rounded-full px-4 py-2 text-xs text-[#737373]">
            ↕️ Scroll pour voir plus
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Button Component
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
      className={`px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-[#DC2626] text-white'
          : 'bg-[#1A1A1A] text-[#A3A3A3] border border-[#333] hover:bg-[#2A2A2A]'
      }`}
    >
      {children}
    </button>
  );
}

// Category Badge Component - Utilise la config centralisée
function CategoryBadge({ category }: { category: Categorie }) {
  const classes = getCategoryClasses(category);
  const config = CATEGORIES_CONFIG[category];
  const label = config?.label || category;
  const emoji = config?.emoji || '';

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${classes}`}>
      {emoji} {label}
    </span>
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ texte, categorie, niveau_provocation: niveauProvocation });
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
