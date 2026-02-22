'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CATEGORIES_CONFIG, CategoryConfig } from '@/config/categories';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [localCategories, setLocalCategories] = useState<Record<string, CategoryConfig>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [showAddGuide, setShowAddGuide] = useState(false);
  const [saved, setSaved] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState<string>('quotidien');
  const [defaultSaved, setDefaultSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }
    }
    // Load default category from localStorage
    const savedDefault = localStorage.getItem('default_game_category');
    if (savedDefault) setDefaultCategory(savedDefault);

    // Load local overrides from localStorage
    const saved = localStorage.getItem('category_overrides');
    if (saved) {
      try {
        const overrides = JSON.parse(saved);
        const merged = { ...CATEGORIES_CONFIG };
        for (const [key, val] of Object.entries(overrides)) {
          if (merged[key]) {
            merged[key] = { ...merged[key], ...(val as Partial<CategoryConfig>) };
          }
        }
        setLocalCategories(merged);
      } catch {
        setLocalCategories({ ...CATEGORIES_CONFIG });
      }
    } else {
      setLocalCategories({ ...CATEGORIES_CONFIG });
    }
  }, [router]);

  const categories = Object.values(localCategories);

  const saveDefaultCategory = (catId: string) => {
    setDefaultCategory(catId);
    localStorage.setItem('default_game_category', catId);
    setDefaultSaved(true);
    setTimeout(() => setDefaultSaved(false), 2000);
  };

  const startEdit = (cat: CategoryConfig) => {
    setEditingId(cat.id);
    setEditLabel(cat.labelFr);
    setEditEmoji(cat.emoji || '');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = { ...localCategories };
    if (updated[editingId]) {
      updated[editingId] = {
        ...updated[editingId],
        label: editLabel,
        labelFr: editLabel,
        emoji: editEmoji,
      };
    }
    setLocalCategories(updated);
    
    // Save overrides to localStorage
    const overrides: Record<string, Partial<CategoryConfig>> = {};
    for (const [key, val] of Object.entries(updated)) {
      const original = CATEGORIES_CONFIG[key];
      if (original && (val.label !== original.label || val.emoji !== original.emoji)) {
        overrides[key] = { label: val.label, labelFr: val.labelFr, emoji: val.emoji };
      }
    }
    localStorage.setItem('category_overrides', JSON.stringify(overrides));
    
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <AdminNav />
      <div className="p-6 overflow-y-auto pb-24">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            Gérer les <span className="text-[#DC2626]">catégories</span>
          </h1>
          <div className="flex gap-2">
            {saved && (
              <span className="text-[#22C55E] text-sm self-center">✓ Sauvegardé</span>
            )}
            <Button variant="primary" onClick={() => setShowAddGuide(true)}>
              + Comment ajouter
            </Button>
          </div>
        </div>
      </header>

      {/* Default category picker */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-[#1A1A1A] border border-[#F59E0B]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F59E0B]">⭐ Catégorie par défaut</h2>
              <p className="text-sm text-[#737373] mt-1">
                Catégorie sélectionnée automatiquement quand un joueur arrive sur le jeu.
              </p>
            </div>
            {defaultSaved && (
              <span className="text-[#22C55E] text-sm font-medium">✓ Sauvegardé !</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => saveDefaultCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  defaultCategory === cat.id
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 scale-105'
                    : 'border-[#333] bg-[#0D0D0D] hover:border-[#555]'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-sm font-medium ${
                  defaultCategory === cat.id ? 'text-[#F59E0B]' : 'text-[#A3A3A3]'
                }`}>
                  {cat.labelFr}
                </span>
                {defaultCategory === cat.id && (
                  <span className="text-xs text-[#F59E0B] font-bold">PAR DÉFAUT</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6"
            >
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editEmoji}
                      onChange={(e) => setEditEmoji(e.target.value)}
                      className="w-16 px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-2xl text-center"
                      placeholder="🏷️"
                    />
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-[#F5F5F5]"
                      placeholder="Nom de la catégorie"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditingId(null)} className="flex-1">
                      Annuler
                    </Button>
                    <Button variant="primary" size="sm" onClick={saveEdit} className="flex-1">
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#F5F5F5]">{cat.labelFr}</h3>
                      <p className="text-sm text-[#737373]">ID: {cat.id}</p>
                    </div>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors text-sm px-3 py-1 rounded-lg bg-[#2A2A2A] hover:bg-[#333]"
                    >
                      ✏️ Renommer
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${cat.color} ${cat.textColor}`}>
                      Aperçu du style
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-[#1A1A1A] border border-[#DC2626]/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#DC2626] mb-3">📁 Fichier de configuration</h2>
          <p className="text-[#A3A3A3] mb-4">
            Les catégories sont définies dans le fichier :
          </p>
          <code className="block bg-[#0D0D0D] p-4 rounded-lg text-[#22C55E] font-mono text-sm mb-4">
            src/config/categories.ts
          </code>
          <p className="text-[#737373] text-sm">
            Les renommages sont stockés localement. Pour un changement permanent, modifiez directement le fichier source.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showAddGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowAddGuide(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-[#F5F5F5] mb-6">📖 Guide : Ajouter une catégorie</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[#DC2626] font-bold mb-2">Étape 1 : Ouvrir le fichier</h3>
                  <code className="block bg-[#0D0D0D] p-3 rounded-lg text-[#22C55E] font-mono text-sm">src/config/categories.ts</code>
                </div>
                <div>
                  <h3 className="text-[#DC2626] font-bold mb-2">Étape 2 : Ajouter votre catégorie</h3>
                  <pre className="bg-[#0D0D0D] p-4 rounded-lg text-[#F5F5F5] font-mono text-sm overflow-x-auto">
{`lifestyle: {
  id: 'lifestyle',
  label: 'Lifestyle',
  labelFr: 'Style de vie',
  color: 'bg-[#8B5CF6]/20',
  textColor: 'text-[#A78BFA]',
  emoji: '🌟'
},`}
                  </pre>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="primary" className="w-full" onClick={() => setShowAddGuide(false)}>
                  J&apos;ai compris !
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
