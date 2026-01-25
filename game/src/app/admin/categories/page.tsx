'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CATEGORIES_CONFIG } from '@/config/categories';

/**
 * PAGE DE GESTION DES CATÉGORIES
 * 
 * Cette page affiche les catégories actuelles et explique comment en ajouter.
 * Pour ajouter une nouvelle catégorie :
 * 
 * 1. Ouvrir /src/config/categories.ts
 * 2. Ajouter une entrée dans CATEGORIES_CONFIG
 * 3. Ajouter la valeur dans types/database.ts si nécessaire
 */

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [showAddGuide, setShowAddGuide] = useState(false);
  
  // Get all categories
  const categories = Object.values(CATEGORIES_CONFIG);

  // Check auth
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6 overflow-y-auto pb-24">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <Link href="/admin/dashboard" className="text-[#A3A3A3] hover:text-[#F5F5F5] text-sm mb-2 block">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            Gérer les <span className="text-[#DC2626]">catégories</span>
          </h1>
          <Button variant="primary" onClick={() => setShowAddGuide(true)}>
            + Comment ajouter
          </Button>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{cat.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F5F5]">{cat.labelFr}</h3>
                  <p className="text-sm text-[#737373]">ID: {cat.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${cat.color} ${cat.textColor}`}>
                  Aperçu du style
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-[#1A1A1A] border border-[#DC2626]/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#DC2626] mb-3">📁 Fichier de configuration</h2>
          <p className="text-[#A3A3A3] mb-4">
            Les catégories sont définies dans le fichier :
          </p>
          <code className="block bg-[#0D0D0D] p-4 rounded-lg text-[#22C55E] font-mono text-sm mb-4">
            src/config/categories.ts
          </code>
          <p className="text-[#737373] text-sm">
            Ce fichier contient toutes les catégories avec leurs couleurs et emojis.
            Modifiez-le directement pour ajouter de nouvelles catégories.
          </p>
        </div>
      </div>

      {/* Add Guide Modal */}
      <AnimatePresence>
        {showAddGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowAddGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-[#F5F5F5] mb-6">
                📖 Guide : Ajouter une catégorie
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[#DC2626] font-bold mb-2">Étape 1 : Ouvrir le fichier</h3>
                  <code className="block bg-[#0D0D0D] p-3 rounded-lg text-[#22C55E] font-mono text-sm">
                    src/config/categories.ts
                  </code>
                </div>

                <div>
                  <h3 className="text-[#DC2626] font-bold mb-2">Étape 2 : Ajouter votre catégorie</h3>
                  <p className="text-[#A3A3A3] mb-2">Ajoutez un bloc comme celui-ci dans CATEGORIES_CONFIG :</p>
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

                <div>
                  <h3 className="text-[#DC2626] font-bold mb-2">Étape 3 (optionnel) : Mise à jour du type</h3>
                  <p className="text-[#A3A3A3] mb-2">Si vous voulez du typage strict, ajoutez dans :</p>
                  <code className="block bg-[#0D0D0D] p-3 rounded-lg text-[#22C55E] font-mono text-sm">
                    src/types/database.ts
                  </code>
                </div>

                <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-lg p-4">
                  <h4 className="text-[#DC2626] font-bold mb-2">💡 Couleurs suggérées</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-[#60A5FA]">Blue: #60A5FA</span>
                    <span className="text-[#34D399]">Green: #34D399</span>
                    <span className="text-[#FBBF24]">Yellow: #FBBF24</span>
                    <span className="text-[#F87171]">Red: #F87171</span>
                    <span className="text-[#A78BFA]">Purple: #A78BFA</span>
                    <span className="text-[#FB923C]">Orange: #FB923C</span>
                  </div>
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
  );
}
