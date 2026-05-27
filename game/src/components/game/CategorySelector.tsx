'use client';

import { useState } from 'react';
import { CATEGORIES_CONFIG, CategoryConfig } from '@/config/categories';

interface CategorySelectorProps {
  onStart: (selectedCategories: string[]) => void;
}

export function CategorySelector({ onStart }: CategorySelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const categories: CategoryConfig[] = Object.values(CATEGORIES_CONFIG);

  const toggleCategory = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStart = () => {
    if (selected.size === 0) return;
    onStart(Array.from(selected));
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-8"
      style={{ minHeight: '100dvh', background: '#0A0A0B' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          🎮 Choisis ton mode
        </h1>
        <p className="text-sm text-[#6B7280]">
          Sélectionne une ou plusieurs catégories
        </p>
      </div>

      {/* Category Cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {categories.map((cat) => {
          const isSelected = selected.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className="w-full rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.97]"
              style={{
                background: isSelected
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isSelected
                  ? '2px solid rgba(239, 68, 68, 0.6)'
                  : '2px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected
                  ? '0 0 24px rgba(239, 68, 68, 0.15)'
                  : 'none',
              }}
            >
              {/* Emoji */}
              <span className="text-3xl shrink-0">{cat.emoji}</span>
              
              {/* Label */}
              <div className="flex-1 text-left">
                <p className="text-lg font-bold text-white">{cat.labelFr}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {cat.id === 'sexe' && 'Relations, flirt, intimité, kinks'}
                  {cat.id === 'quotidien' && 'Habitudes, comportements du quotidien'}
                  {cat.id === 'metiers' && 'Métiers, attitudes au travail'}
                </p>
              </div>

              {/* Checkbox indicator */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: isSelected ? '#DC2626' : 'rgba(255,255,255,0.06)',
                  border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.15)',
                }}
              >
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info text */}
      {selected.size > 1 && (
        <p className="text-xs text-[#6B7280] text-center mb-4 max-w-xs">
          Les challenges alterneront entre les catégories sélectionnées
        </p>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={selected.size === 0}
        className="w-full max-w-sm py-4 rounded-xl font-black text-base tracking-wide transition-all duration-200 active:scale-[0.97]"
        style={{
          background: selected.size > 0
            ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
            : 'rgba(255,255,255,0.04)',
          border: selected.size > 0
            ? '1px solid #EF4444'
            : '1px solid rgba(255,255,255,0.06)',
          color: selected.size > 0 ? '#fff' : '#3F3F46',
          boxShadow: selected.size > 0
            ? '0 8px 32px rgba(239,68,68,0.35)'
            : 'none',
          cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        {selected.size > 0 ? "🚩 C'EST PARTI" : 'Sélectionne au moins une catégorie'}
      </button>
    </div>
  );
}
