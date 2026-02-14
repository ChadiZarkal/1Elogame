'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES_CONFIG, CategoryConfig } from '@/config/categories';

export type GameMode = 'default' | 'thematique';

export interface GameModeSelection {
  mode: GameMode;
  category: string | null; // null = toutes catégories (default mode)
}

interface GameModeMenuProps {
  currentSelection: GameModeSelection;
  onSelectionChange: (selection: GameModeSelection) => void;
}

export function GameModeMenu({ currentSelection, onSelectionChange }: GameModeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Masquer l'animation de pulsation après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Charger les catégories dynamiquement depuis la config
  // Utilisation directe au lieu d'un useEffect pour éviter les re-renders inutiles
  const categories: CategoryConfig[] = Object.values(CATEGORIES_CONFIG);

  const handleDefaultMode = () => {
    onSelectionChange({ mode: 'default', category: null });
    setIsOpen(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    onSelectionChange({ mode: 'thematique', category: categoryId });
    setIsOpen(false);
  };

  // Indicateur visuel du mode actuel
  const getCurrentModeLabel = (): string => {
    if (currentSelection.mode === 'default') {
      return '🌍';
    }
    const cat = categories.find(c => c.id === currentSelection.category);
    return cat?.emoji || '🎯';
  };

  const isFiltered = currentSelection.mode === 'thematique';

  return (
    <div className="relative">
      {/* Bouton principal avec label */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setShowPulse(false); }}
        className={`
          relative px-4 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-2
          ${isFiltered 
            ? 'bg-purple-500/30 ring-2 ring-purple-400 shadow-lg shadow-purple-500/20' 
            : 'bg-white/10 hover:bg-white/20 border border-white/20'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={showPulse ? {
          boxShadow: [
            '0 0 0 0 rgba(168, 85, 247, 0.4)',
            '0 0 0 10px rgba(168, 85, 247, 0)',
            '0 0 0 0 rgba(168, 85, 247, 0)'
          ]
        } : {}}
        transition={showPulse ? { duration: 2, repeat: Infinity } : {}}
        title="Clique pour changer de mode"
      >
        <span className="text-xl">{getCurrentModeLabel()}</span>
        <span className="text-white/80 text-sm font-medium whitespace-nowrap">Mode de jeu</span>
        
        {/* Indicateur de filtre actif */}
        {isFiltered && (
          <motion.span 
            className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          />
        )}
        
        {/* Flèche indicatrice */}
        <motion.span
          className="text-white/60 text-xs ml-1"
          animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute right-0 mt-2 w-64 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <h3 className="text-white font-bold text-sm">🎮 Mode de jeu</h3>
              </div>

              <div className="py-2">
                {/* Mode Default */}
                <button
                  onClick={handleDefaultMode}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 transition-colors
                    ${currentSelection.mode === 'default'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-xl">🌍</span>
                  <div className="text-left">
                    <p className="font-medium">Classique</p>
                    <p className="text-xs text-white/50">Toutes les catégories mélangées</p>
                  </div>
                  {currentSelection.mode === 'default' && (
                    <span className="ml-auto text-purple-400">✓</span>
                  )}
                </button>

                {/* Divider */}
                <div className="my-2 mx-4 border-t border-white/10" />

                {/* Label Thématique */}
                <div className="px-4 py-2">
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                    Thématique
                  </p>
                </div>

                {/* Catégories */}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 transition-colors
                      ${currentSelection.mode === 'thematique' && currentSelection.category === cat.id
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-white/80 hover:bg-white/5'
                      }
                    `}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="font-medium">{cat.labelFr}</span>
                    {currentSelection.mode === 'thematique' && currentSelection.category === cat.id && (
                      <span className="ml-auto text-purple-400">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer - Reset si filtre actif */}
              {isFiltered && (
                <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                  <button
                    onClick={handleDefaultMode}
                    className="w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕ Revenir au mode classique
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export des defaults pour usage externe
export const DEFAULT_GAME_MODE: GameModeSelection = {
  mode: 'thematique',
  category: 'lifestyle',
};
