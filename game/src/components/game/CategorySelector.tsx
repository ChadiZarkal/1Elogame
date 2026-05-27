'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES_CONFIG, CategoryConfig } from '@/config/categories';
import { type PartySize } from '@/stores/gameStore';

const PARTY_SIZES: { value: PartySize; label: string; tag: string }[] = [
  { value: 10, label: '10', tag: '⚡ Rapide' },
  { value: 15, label: '15', tag: '🎯 Classique' },
  { value: 20, label: '20', tag: '🏆 Expert' },
];

interface CategorySelectorProps {
  onStart: (selectedCategories: string[], partySize: PartySize) => void;
}

export function CategorySelector({ onStart }: CategorySelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [partySize, setPartySize] = useState<PartySize>(15);
  const [showRules, setShowRules] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('rog_has_played');
  });
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
    localStorage.setItem('rog_has_played', '1');
    onStart(Array.from(selected), partySize);
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-6"
      style={{ minHeight: '100dvh', background: '#0A0A0B' }}
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          🎮 Choisis ton mode
        </h1>
        <p className="text-sm text-[#6B7280]">
          Sélectionne une ou plusieurs catégories
        </p>
      </div>

      {/* Category Cards */}
      <div className="w-full max-w-sm space-y-3 mb-5">
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
              <span className="text-3xl shrink-0">{cat.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-lg font-bold text-white">{cat.labelFr}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {cat.id === 'sexe' && 'Relations, flirt, intimité, kinks'}
                  {cat.id === 'quotidien' && 'Habitudes, comportements du quotidien'}
                  {cat.id === 'metiers' && 'Métiers, attitudes au travail'}
                </p>
              </div>
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

      {/* Duel count selector */}
      <div className="w-full max-w-sm mb-5">
        <label className="block text-[0.6rem] font-black tracking-[0.14em] uppercase text-[#555] mb-2">
          Nombre de duels
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Nombre de duels">
          {PARTY_SIZES.map(s => {
            const sel = partySize === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setPartySize(s.value)}
                role="radio"
                aria-checked={sel}
                className="flex flex-col items-center py-3 px-2 rounded-lg transition-all"
                style={{
                  background: sel ? 'rgba(255,45,45,0.12)' : '#0C0C0E',
                  border: `1px solid ${sel ? 'rgba(255,45,45,0.35)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <span className="text-xl font-black" style={{ color: sel ? '#FF6B6B' : '#666' }}>
                  {s.label}
                </span>
                <span className="text-[0.55rem] font-bold mt-0.5" style={{ color: sel ? '#FF6B6B' : '#555' }}>
                  {s.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules — collapsible */}
      <div className="w-full max-w-sm mb-5 rounded-xl overflow-hidden" style={{ background: '#0C0C0E', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setShowRules(!showRules)}
          aria-expanded={showRules}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
        >
          <span className="text-xs font-bold flex items-center gap-2">
            <span>📖</span>
            <span style={{ color: '#ddd' }}>Comment ça marche ?</span>
          </span>
          <span className="text-[0.6rem] transition-transform" style={{ transform: showRules ? 'rotate(180deg)' : 'none' }}>▼</span>
        </button>
        {showRules && (
          <div className="px-4 pb-3">
            <div className="flex flex-col gap-2">
              {[
                { e: '🆚', t: '2 situations apparaissent : choisis le pire Red Flag' },
                { e: '📊', t: 'Découvre si la communauté est d\'accord avec toi' },
                { e: '🏆', t: 'Obtiens ton profil personnalisé en fin de partie' },
              ].map(r => (
                <div key={r.t} className="flex gap-2 items-start">
                  <span className="text-sm shrink-0 leading-tight">{r.e}</span>
                  <span className="text-[0.7rem] text-[#aaa] leading-snug font-medium">{r.t}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2 rounded-md" style={{ background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.1)' }}>
              <p className="text-[0.6rem] text-[#999] leading-relaxed m-0">
                🔬 Tes votes mettent à jour les <strong className="text-[#ddd]">classements communautaires</strong> par sexe et âge.
                {' '}<a href="/classement" className="text-[#FF6B6B] font-bold no-underline text-[0.6rem]">Voir →</a>
              </p>
            </div>
          </div>
        )}
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
        {selected.size > 0 ? `🚩 LANCER · ${partySize} duels` : 'Sélectionne au moins une catégorie'}
      </button>
    </div>
  );
}
