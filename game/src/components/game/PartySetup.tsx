'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, type PartySize, type PartyConfig } from '@/stores/gameStore';
import { CATEGORIES_CONFIG } from '@/config/categories';

const PARTY_SIZES: { value: PartySize; label: string; tag: string }[] = [
  { value: 10, label: '10', tag: '⚡ Rapide' },
  { value: 15, label: '15', tag: '🎯 Classique' },
  { value: 20, label: '20', tag: '🏆 Expert' },
];

const CATEGORY_OPTIONS = [
  { id: null, label: 'Toutes', emoji: '🌍' },
  ...Object.values(CATEGORIES_CONFIG).map(cat => ({
    id: cat.id,
    label: cat.labelFr,
    emoji: cat.emoji || '🎯',
  })),
];

export function PartySetup() {
  const router = useRouter();
  const { hasProfile, startParty } = useGameStore();
  const [partySize, setPartySize] = useState<PartySize>(15);
  const [category, setCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showRules, setShowRules] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('rog_has_played');
  });

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!hasProfile) router.push('/jeu');
  }, [hasProfile, router]);

  const handleStart = () => {
    localStorage.setItem('rog_has_played', '1');
    startParty({ size: partySize, originalSize: partySize, category });
  };

  if (!hasProfile) return null;

  return (
    <div className="hub" style={{ minHeight: '100dvh' }}>
      <div className="hub__texture" aria-hidden="true" />

      <main
        className={`hub__main ${mounted ? 'hub__main--visible' : ''}`}
        style={{ padding: 'clamp(1rem, 4vw, 2rem) 1.25rem 1.5rem', justifyContent: 'center' }}
      >
        {/* Back */}
        <button
          onClick={() => router.push('/jeu')}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 50,
            color: '#777', fontSize: '0.75rem', fontWeight: 700,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem',
          }}
          aria-label="Retour"
        >
          ← Retour
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
          <h1 style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 900,
            color: '#F5F5F7', margin: 0, letterSpacing: '-0.02em',
          }}>
            🚩 Lancer une partie
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.3rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
            Choisis et joue
          </p>
        </div>

        {/* Category chips — horizontal scroll */}
        <div style={{ marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
          <label style={{
            display: 'block', fontSize: '0.6rem', fontWeight: 900,
            letterSpacing: '0.14em', textTransform: 'uppercase' as const,
            color: '#555', marginBottom: '0.4rem',
          }}>
            Catégorie
          </label>
          <div
            role="radiogroup" aria-label="Choix de catégorie"
            style={{
              display: 'flex', gap: '0.4rem', overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORY_OPTIONS.map(cat => {
              const sel = category === cat.id;
              return (
                <button
                  key={cat.id ?? 'all'}
                  onClick={() => setCategory(cat.id)}
                  role="radio" aria-checked={sel}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.4rem 0.7rem', borderRadius: 6,
                    fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                    background: sel ? 'rgba(255,45,45,0.12)' : '#0C0C0E',
                    border: `1px solid ${sel ? 'rgba(255,45,45,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    color: sel ? '#FF6B6B' : '#999',
                    cursor: 'pointer', transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Party size — 3-col grid */}
        <div style={{ marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
          <label style={{
            display: 'block', fontSize: '0.6rem', fontWeight: 900,
            letterSpacing: '0.14em', textTransform: 'uppercase' as const,
            color: '#555', marginBottom: '0.4rem',
          }}>
            Nombre de duels
          </label>
          <div role="radiogroup" aria-label="Nombre de duels"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}
          >
            {PARTY_SIZES.map(s => {
              const sel = partySize === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setPartySize(s.value)}
                  role="radio" aria-checked={sel}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '0.5rem 0.4rem', borderRadius: 8,
                    background: sel ? 'rgba(255,45,45,0.12)' : '#0C0C0E',
                    border: `1px solid ${sel ? 'rgba(255,45,45,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    fontSize: '1.3rem', fontWeight: 900,
                    color: sel ? '#FF6B6B' : '#666', lineHeight: 1,
                  }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: sel ? '#FF6B6B' : '#555', fontWeight: 700, marginTop: '0.15rem' }}>
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* How it works — compact collapsible */}
        <div style={{
          background: '#0C0C0E', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 'clamp(0.5rem, 2vw, 0.75rem)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setShowRules(!showRules)}
            aria-expanded={showRules} aria-controls="party-rules"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.6rem 0.75rem', background: 'none', border: 'none',
              cursor: 'pointer', color: '#999',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>🧪</span>
              <span style={{ color: '#ccc' }}>Comment ça marche ?</span>
            </span>
            <span style={{ fontSize: '0.6rem', transition: 'transform 0.2s', transform: showRules ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>
          {showRules && (
            <div id="party-rules" style={{ padding: '0 0.75rem 0.65rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  { e: '🆚', t: '2 situations, choisis le pire Red Flag' },
                  { e: '📊', t: 'Compare ton avis avec la communauté' },
                  { e: '🏆', t: 'Récap personnalisé en fin de partie' },
                ].map(r => (
                  <div key={r.t} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{r.e}</span>
                    <span style={{ fontSize: '0.68rem', color: '#999', lineHeight: 1.3 }}>{r.t}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '0.5rem', padding: '0.4rem 0.6rem', borderRadius: 6,
                background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.1)',
              }}>
                <p style={{ fontSize: '0.6rem', color: '#999', lineHeight: 1.5, margin: 0 }}>
                  🔬 Tes votes mettent à jour les <strong style={{ color: '#ddd' }}>classements communautaires</strong> par sexe et âge.
                  {' '}<a href="/classement" style={{ color: '#FF6B6B', fontWeight: 700, textDecoration: 'none', fontSize: '0.6rem' }}>Voir →</a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Launch CTA */}
        <button
          onClick={handleStart}
          className="hub__card-go hub__card-go--red"
          style={{
            width: '100%', padding: '0.7rem 1rem',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #DC2626, #EF4444)',
            color: '#fff', fontSize: '0.8rem', fontWeight: 900,
            letterSpacing: '0.04em', textTransform: 'uppercase' as const,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,45,45,0.25)',
            display: 'block', textAlign: 'center',
          }}
        >
          🚩 LANCER · {partySize} duels
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.55rem', color: '#444', marginTop: '0.4rem' }}>
          Gratuit · Sans inscription
        </p>
      </main>
    </div>
  );
}
