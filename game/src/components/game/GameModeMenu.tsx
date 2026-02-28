'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES_CONFIG, CategoryConfig } from '@/config/categories';
import type { GameModeSelection } from '@/stores/gameStore';

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

  // Fermer le menu avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Charger les catégories dynamiquement depuis la config
  const categories: CategoryConfig[] = Object.values(CATEGORIES_CONFIG);

  const handleDefaultMode = useCallback(() => {
    onSelectionChange({ mode: 'default', category: null });
    setIsOpen(false);
  }, [onSelectionChange]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    onSelectionChange({ mode: 'thematique', category: categoryId });
    setIsOpen(false);
  }, [onSelectionChange]);

  // Indicateur visuel du mode actuel
  const getCurrentModeLabel = (): { emoji: string; name: string } => {
    if (currentSelection.mode === 'default') {
      return { emoji: '🌍', name: 'Toutes' };
    }
    const cat = categories.find(c => c.id === currentSelection.category);
    return { emoji: cat?.emoji || '🎯', name: cat?.labelFr || 'Toutes' };
  };

  const isFiltered = currentSelection.mode === 'thematique';
  const currentLabel = getCurrentModeLabel();

  return (
    <div className="relative">
      {/* Bouton principal avec label + nom catégorie */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowPulse(false); }}
        className={`
          relative px-3 py-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5
          hover:scale-105 active:scale-95
          ${isFiltered 
            ? 'bg-purple-500/30 ring-2 ring-purple-400 shadow-lg shadow-purple-500/20' 
            : 'bg-white/10 hover:bg-white/20 border border-white/20'
          }
          ${showPulse ? 'animate-menu-pulse' : ''}
        `}
        title="Changer de catégorie"
      >
        <span className="text-lg">{currentLabel.emoji}</span>
        <span className="text-xs font-semibold text-white/80 max-w-[80px] truncate">{currentLabel.name}</span>
        
        {/* Indicateur de filtre actif */}
        {isFiltered && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-streak-pop" />
        )}
        
        {/* Flèche indicatrice */}
        <span
          className="text-white/60 text-xs transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 z-[60] overflow-hidden animate-dropdown-enter">
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
            </div>
          </>
        )}
    </div>
  );
}
