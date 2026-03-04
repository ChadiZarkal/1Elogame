'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, type PartyStats } from '@/stores/gameStore';
import { CATEGORIES_CONFIG } from '@/config/categories';

// ── Personality Archetypes ──────────────────────────────────────────────

interface Archetype {
  title: string;
  emoji: string;
  description: string;
  tagline: string;
}

function getArchetype(accuracy: number, bestStreak: number, avgReactionMs: number): Archetype {
  const pct = accuracy * 100;
  const fast = avgReactionMs < 3000;
  const hotStreak = bestStreak >= 5;

  if (pct >= 90) {
    if (fast) return {
      title: 'Sniper Absolu',
      emoji: '🎯',
      description: 'Rapide ET précis·e. Tu détectes les red flags en un clin d\'œil.',
      tagline: 'Sniper Absolu. Je vois les red flags avant qu\'ils n\'existent.',
    };
    return {
      title: 'Radar Absolu',
      emoji: '🛸',
      description: 'Tu vois les red flags avant même qu\'ils existent.',
      tagline: 'Radar Absolu. Personne ne peut mentir devant moi.',
    };
  }
  if (pct >= 75) {
    if (fast && hotStreak) return {
      title: 'Instinct de Chasseur·se',
      emoji: '🦊',
      description: 'Réflexes affûtés et intuition redoutable.',
      tagline: 'Instinct de Chasseur·se. Mon intuition ne me trompe jamais.',
    };
    if (hotStreak) return {
      title: 'Machine à Streak',
      emoji: '🔥',
      description: 'Quand tu es lancé·e, rien ne t\'arrête.',
      tagline: 'Machine à Streak. Rien ne m\'arrête.',
    };
    return {
      title: 'Détecteur·rice Pro',
      emoji: '🔍',
      description: 'Tu as un sixième sens pour les red flags.',
      tagline: 'Détecteur·rice Pro. Mon instinct est redoutable.',
    };
  }
  if (pct >= 60) {
    if (fast) return {
      title: 'Réflexe Instinctif',
      emoji: '⚡',
      description: 'Tu tires vite — parfois juste, parfois non.',
      tagline: 'Réflexe Instinctif. Je tire d\'abord, je réfléchis après.',
    };
    return {
      title: 'Sentinelle',
      emoji: '🛡️',
      description: 'Tu repères la plupart des red flags. Solidement au-dessus de la moyenne.',
      tagline: 'Sentinelle. Vigilant·e mais pas infaillible.',
    };
  }
  if (pct >= 45) return {
    title: 'Électron Libre',
    emoji: '🎲',
    description: 'Tes réponses divisent la communauté. Un regard unique.',
    tagline: 'Électron Libre. Mes opinions divisent.',
  };
  if (pct >= 30) return {
    title: 'Optimiste Invétéré·e',
    emoji: '🌈',
    description: 'Tu vois le meilleur chez les gens — même quand il n\'y en a pas.',
    tagline: 'Optimiste Invétéré·e. Je vois du green flag partout.',
  };
  return {
    title: 'Anti-conformiste',
    emoji: '🎭',
    description: 'Tu votes à l\'opposé de la majorité. Visionnaire ou chaotique.',
    tagline: 'Anti-conformiste. En désaccord avec tout le monde.',
  };
}

function getSpeedProfile(avgMs: number): { label: string; emoji: string } {
  if (avgMs < 2000) return { label: 'Instinctif·ve', emoji: '⚡' };
  if (avgMs < 4000) return { label: 'Décidé·e', emoji: '🎯' };
  if (avgMs < 7000) return { label: 'Réfléchi·e', emoji: '🤔' };
  return { label: 'Philosophe', emoji: '🧠' };
}

// ── Stats computation ───────────────────────────────────────────────────

function computeDetailedStats(stats: PartyStats) {
  const totalDuels = stats.results.length;
  const accuracy = totalDuels > 0 ? stats.correctGuesses / totalDuels : 0;

  const reactionTimes = stats.results
    .map(r => r.reactionTimeMs)
    .filter((t): t is number => t !== undefined && t > 0);
  const avgReactionMs = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 5000;

  let mostPopular = { textA: '', textB: '', winner: '', percentage: 0 };
  let mostControversial = { textA: '', textB: '', winner: '', percentage: 100 };

  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    const pct = entry.result.winner.percentage;
    const winnerText = entry.result.winner.id === entry.duel.elementA.id
      ? entry.duel.elementA.texte : entry.duel.elementB.texte;

    if (pct > mostPopular.percentage) {
      mostPopular = {
        textA: entry.duel.elementA.texte,
        textB: entry.duel.elementB.texte,
        winner: winnerText,
        percentage: pct,
      };
    }
    if (pct < mostControversial.percentage) {
      mostControversial = {
        textA: entry.duel.elementA.texte,
        textB: entry.duel.elementB.texte,
        winner: winnerText,
        percentage: pct,
      };
    }
  }

  // Category breakdown
  const categoryVotes: Record<string, { total: number; correct: number }> = {};
  for (const entry of stats.results) {
    const winnerId = entry.result.winner.id;
    const winnerEl = winnerId === entry.duel.elementA.id ? entry.duel.elementA : entry.duel.elementB;
    const cat = winnerEl.categorie;
    if (!categoryVotes[cat]) categoryVotes[cat] = { total: 0, correct: 0 };
    categoryVotes[cat].total++;
    if (!entry.result.isOptimistic && entry.result.winner.percentage >= 50) {
      categoryVotes[cat].correct++;
    }
  }

  // Agreement rate (how often user agrees with community majority)
  let agreementCount = 0;
  let nonOptimistic = 0;
  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    nonOptimistic++;
    if (entry.result.winner.percentage >= 50) agreementCount++;
  }
  const agreementRate = nonOptimistic > 0 ? Math.round((agreementCount / nonOptimistic) * 100) : 0;

  const durationMs = stats.endedAt - stats.startedAt;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  const fastestMs = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
  const slowestMs = reactionTimes.length > 0 ? Math.max(...reactionTimes) : 0;

  return {
    totalDuels, accuracy, accuracyPct: Math.round(accuracy * 100),
    avgReactionMs, mostPopular, mostControversial, categoryVotes,
    durationMin, durationSec, fastestMs, slowestMs, agreementRate,
  };
}

// ── Shared CSS-in-JS helpers ────────────────────────────────────────────

const card = (accent?: string): React.CSSProperties => ({
  background: '#0C0C0E',
  border: `1px solid ${accent ? `rgba(${accent},0.2)` : 'rgba(255,255,255,0.06)'}`,
  borderRadius: 10,
  padding: '0.75rem',
});

const labelStyle: React.CSSProperties = {
  fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: '#555', marginBottom: '0.4rem', display: 'block',
};

// ── Main Component ──────────────────────────────────────────────────────

export function GameRecap() {
  const router = useRouter();
  const { partyStats, partyConfig, resetGame, continueParty, profile } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllDuels, setShowAllDuels] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 90, origin: { x: 0.5, y: 0.35 }, colors: ['#FF2D2D', '#F97316', '#10B981', '#3B82F6'], scalar: 0.8, zIndex: 9999 });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 50, origin: { x: 0, y: 0.6 }, colors: ['#FF2D2D'], zIndex: 9999 });
        confetti({ particleCount: 50, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors: ['#10B981'], zIndex: 9999 });
      }, 350);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!partyStats) router.push('/jeu/jouer');
  }, [partyStats, router]);

  const stats = useMemo(() => {
    if (!partyStats) return null;
    return computeDetailedStats(partyStats);
  }, [partyStats]);

  if (!partyStats || !stats) return null;

  const archetype = getArchetype(stats.accuracy, partyStats.bestStreak, stats.avgReactionMs);
  const speedProfile = getSpeedProfile(stats.avgReactionMs);
  const categoryLabel = partyStats.category
    ? CATEGORIES_CONFIG[partyStats.category]?.labelFr || partyStats.category
    : 'Toutes catégories';

  const shareText = [
    `🚩 Red or Green`,
    `${archetype.emoji} ${archetype.title}`,
    `📊 ${stats.accuracyPct}% · 🔥 Streak ${partyStats.bestStreak} · ${speedProfile.emoji} ${(stats.avgReactionMs / 1000).toFixed(1)}s`,
    `« ${archetype.tagline} »`,
    `Et toi ? 👀 → redorgreen.fr/jeu`,
  ].join('\n');

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: 'https://redorgreen.fr/jeu?ref=recap' }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleContinue = () => {
    continueParty(partyConfig?.originalSize ?? 15);
    router.push('/jeu/jouer');
  };

  const handleNewParty = () => {
    resetGame();
    if (profile) useGameStore.getState().setProfile(profile);
    router.push('/jeu/jouer');
  };

  // Duels to show in the recap review
  const duelsToShow = showAllDuels ? partyStats.results : partyStats.results.slice(0, 5);

  return (
    <div className="hub" style={{ minHeight: '100dvh' }}>
      <div className="hub__texture" aria-hidden="true" />

      <main
        className={`hub__main ${mounted ? 'hub__main--visible' : ''}`}
        style={{ padding: 'clamp(0.75rem, 3vw, 1.5rem) 1.25rem 1.5rem' }}
      >
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SCREENSHOT CARD                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          id="recap-card"
          style={{
            background: 'linear-gradient(180deg, #0E0E11 0%, #0A0A0C 100%)',
            border: '1.5px solid rgba(255,45,45,0.2)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Brand + Archetype header */}
          <div style={{
            padding: '0.75rem 0.75rem 0.6rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(255,45,45,0.08) 0%, transparent 100%)',
          }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', color: '#888', margin: '0 0 0.4rem' }}>
              🚩 RED <span style={{ color: '#FF2D2D' }}>OR</span> GREEN
            </p>
            <span style={{ fontSize: '2.2rem', display: 'block', lineHeight: 1 }}>{archetype.emoji}</span>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F5F5F7', margin: '0.25rem 0 0.15rem', letterSpacing: '-0.02em' }}>
              {archetype.title}
            </h1>
            <p style={{ fontSize: '0.65rem', color: '#999', margin: 0, lineHeight: 1.4 }}>
              {archetype.description}
            </p>
          </div>

          {/* Stats row — 3 compact boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', padding: '0 0.6rem 0.5rem' }}>
            <StatBox value={`${stats.accuracyPct}%`} label="Précision" accent={stats.accuracyPct >= 60 ? '16,185,129' : '255,45,45'} />
            <StatBox value={`${partyStats.bestStreak}🔥`} label="Best streak" accent="255,45,45" />
            <StatBox value={`${(stats.avgReactionMs / 1000).toFixed(1)}s`} label={speedProfile.label} accent="59,130,246" />
          </div>

          {/* Party meta */}
          <div style={{
            margin: '0 0.6rem 0.5rem', padding: '0.3rem 0.5rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: 6,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 600 }}>
              {stats.totalDuels} duels · {categoryLabel}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 600 }}>
              {stats.durationMin > 0 ? `${stats.durationMin}min ` : ''}{stats.durationSec}s
            </span>
          </div>

          {/* Tagline — the viral one-liner */}
          <div style={{
            margin: '0 0.6rem 0.6rem', padding: '0.5rem',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(255,45,45,0.05) 0%, rgba(124,58,237,0.05) 100%)',
            border: '1px solid rgba(255,45,45,0.1)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.72rem', color: '#ddd', fontWeight: 700, fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
              « {archetype.tagline} »
            </p>
            <p style={{ fontSize: '0.5rem', color: '#555', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginTop: '0.25rem' }}>
              redorgreen.fr 🚩
            </p>
          </div>
        </div>

        {/* Share prompt */}
        <p style={{ textAlign: 'center', fontSize: '0.6rem', color: '#555', margin: '0.4rem 0' }}>
          📸 Screenshot ou partage ton profil
        </p>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ANALYSIS SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* Highlights — most popular & controversial */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {stats.mostPopular.winner && (
            <div style={{ ...card('16,185,129') }}>
              <p style={{ ...labelStyle, color: '#059669' }}>🎯 + Populaire</p>
              <p style={{ fontSize: '0.68rem', color: '#ddd', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
                &ldquo;{stats.mostPopular.winner}&rdquo;
              </p>
              <p style={{ fontSize: '0.55rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
                {stats.mostPopular.percentage}% d&apos;accord
              </p>
            </div>
          )}
          {stats.mostControversial.winner && stats.mostControversial.percentage < 50 && (
            <div style={{ ...card('255,45,45') }}>
              <p style={{ ...labelStyle, color: '#EF4444' }}>🔥 + Clivant</p>
              <p style={{ fontSize: '0.68rem', color: '#ddd', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
                &ldquo;{stats.mostControversial.winner}&rdquo;
              </p>
              <p style={{ fontSize: '0.55rem', color: '#FCA5A5', marginTop: '0.2rem' }}>
                {stats.mostControversial.percentage}% seulement
              </p>
            </div>
          )}
        </div>

        {/* Analysis cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {/* Agreement rate */}
          <div style={card()}>
            <p style={labelStyle}>🤝 Accord communauté</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: stats.agreementRate >= 60 ? '#10B981' : '#FF6B6B', margin: 0 }}>
              {stats.agreementRate}%
            </p>
            <p style={{ fontSize: '0.55rem', color: '#666', marginTop: '0.1rem' }}>
              {stats.agreementRate >= 75 ? 'Très consensuel·le' : stats.agreementRate >= 50 ? 'Dans la norme' : 'Esprit rebelle'}
            </p>
          </div>

          {/* Speed analysis */}
          <div style={card()}>
            <p style={labelStyle}>⏱️ Vitesse</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ddd', margin: 0 }}>
                  {(stats.avgReactionMs / 1000).toFixed(1)}s
                </p>
                <p style={{ fontSize: '0.5rem', color: '#555' }}>moy.</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6', margin: 0 }}>
                  {stats.fastestMs > 0 ? `${(stats.fastestMs / 1000).toFixed(1)}s` : '—'}
                </p>
                <p style={{ fontSize: '0.5rem', color: '#555' }}>rapide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(stats.categoryVotes).length > 1 && (
          <div style={{ ...card(), marginBottom: '0.5rem' }}>
            <p style={labelStyle}>📊 Par catégorie</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {Object.entries(stats.categoryVotes)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([catId, data]) => {
                  const cat = CATEGORIES_CONFIG[catId];
                  const pct = Math.round((data.total / stats.totalDuels) * 100);
                  const correctPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                  return (
                    <div key={catId} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', width: 18, textAlign: 'center' }}>{cat?.emoji || '📦'}</span>
                      <span style={{ fontSize: '0.65rem', color: '#999', width: 55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat?.labelFr || catId}
                      </span>
                      <div style={{ flex: 1, height: 5, background: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3, width: `${pct}%`,
                          background: correctPct >= 60 ? '#10B981' : '#EF4444',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.55rem', color: '#666', width: 28, textAlign: 'right' }}>
                        {correctPct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Duel-by-duel review (shows BOTH elements) ── */}
        <div style={{ ...card(), marginBottom: '0.5rem' }}>
          <p style={labelStyle}>🆚 Récap duel par duel</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {duelsToShow.map((entry, i) => {
              const correct = !entry.result.isOptimistic && entry.result.winner.percentage >= 50;
              const isA = entry.result.winner.id === entry.duel.elementA.id;
              const winnerText = isA ? entry.duel.elementA.texte : entry.duel.elementB.texte;
              const loserText = isA ? entry.duel.elementB.texte : entry.duel.elementA.texte;
              const pct = entry.result.isOptimistic ? null : entry.result.winner.percentage;

              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${correct ? 'rgba(16,185,129,0.12)' : 'rgba(255,45,45,0.12)'}`,
                    background: correct ? 'rgba(16,185,129,0.03)' : 'rgba(255,45,45,0.03)',
                    padding: '0.4rem 0.5rem',
                  }}
                >
                  {/* Duel number + verdict */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.55rem', color: '#555', fontWeight: 700 }}>
                      Duel {i + 1}
                    </span>
                    <span style={{ fontSize: '0.55rem', color: correct ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {correct ? '✅ Majorité' : '❌ Minorité'}
                      {pct !== null && ` · ${pct}%`}
                    </span>
                  </div>
                  {/* The two options */}
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'stretch' }}>
                    {/* Winner (user's pick) */}
                    <div style={{
                      flex: 1, padding: '0.3rem 0.4rem', borderRadius: 5,
                      background: 'rgba(255,45,45,0.08)',
                      borderLeft: '2px solid #FF2D2D',
                    }}>
                      <p style={{ fontSize: '0.55rem', color: '#FF6B6B', fontWeight: 800, margin: '0 0 0.1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                        🚩 Ton choix
                      </p>
                      <p style={{ fontSize: '0.62rem', color: '#ccc', margin: 0, lineHeight: 1.3, fontWeight: 600 }}>
                        {winnerText}
                      </p>
                    </div>
                    {/* Loser (the other option) */}
                    <div style={{
                      flex: 1, padding: '0.3rem 0.4rem', borderRadius: 5,
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: '2px solid #333',
                    }}>
                      <p style={{ fontSize: '0.55rem', color: '#555', fontWeight: 800, margin: '0 0 0.1rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                        VS
                      </p>
                      <p style={{ fontSize: '0.62rem', color: '#888', margin: 0, lineHeight: 1.3, fontWeight: 600 }}>
                        {loserText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {partyStats.results.length > 5 && (
            <button
              onClick={() => setShowAllDuels(!showAllDuels)}
              style={{
                width: '100%', marginTop: '0.35rem', padding: '0.3rem',
                background: 'none', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 5, color: '#777', fontSize: '0.6rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {showAllDuels ? '▲ Voir moins' : `▼ Voir les ${partyStats.results.length} duels`}
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ACTIONS                                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {/* Share */}
          <button
            onClick={handleShare}
            style={{
              width: '100%', padding: '0.6rem',
              borderRadius: 8,
              background: copied ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #DC2626, #EF4444)',
              border: `1px solid ${copied ? '#10B981' : 'rgba(255,45,45,0.3)'}`,
              color: '#fff', fontSize: '0.75rem', fontWeight: 900,
              letterSpacing: '0.04em', textTransform: 'uppercase' as const,
              cursor: 'pointer',
              boxShadow: `0 4px 16px ${copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,45,45,0.2)'}`,
            }}
          >
            {copied ? '✅ Copié !' : '📤 PARTAGER'}
          </button>

          {/* New party + Continue — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              onClick={handleNewParty}
              style={{
                padding: '0.5rem', borderRadius: 8,
                background: '#0C0C0E',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ccc', fontSize: '0.68rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎯 Nouvelle partie
            </button>
            <button
              onClick={handleContinue}
              style={{
                padding: '0.5rem', borderRadius: 8,
                background: '#0C0C0E',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#999', fontSize: '0.68rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 +{partyConfig?.originalSize || 15} duels
            </button>
          </div>

          {/* Rankings + secondary */}
          <a
            href="/classement"
            style={{
              display: 'block', width: '100%', padding: '0.5rem',
              borderRadius: 8, textAlign: 'center',
              background: '#0C0C0E',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#FCD34D', fontSize: '0.68rem', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            🏆 Classements
          </a>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="/flagornot" style={{ fontSize: '0.65rem', color: '#666', textDecoration: 'none' }}>🔮 Oracle</a>
            <a href="/" style={{ fontSize: '0.65rem', color: '#666', textDecoration: 'none' }}>🏠 Accueil</a>
          </div>
        </div>

        {/* Sociological footer */}
        <div style={{
          borderRadius: 8, padding: '0.5rem 0.6rem',
          background: 'rgba(255,45,45,0.03)', border: '1px solid rgba(255,45,45,0.08)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.6rem', color: '#888', lineHeight: 1.5, margin: 0 }}>
            🔬 Tes votes alimentent les <strong style={{ color: '#ccc' }}>classements</strong> par sexe et tranche d&apos;âge.
          </p>
          <a href="/classement" style={{ fontSize: '0.6rem', color: '#FF6B6B', fontWeight: 700, textDecoration: 'none' }}>
            Explorer →
          </a>
        </div>
      </main>
    </div>
  );
}

// ── Small stat box component ────────────────────────────────────────────

function StatBox({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '0.4rem 0.25rem',
      borderRadius: 8,
      background: `rgba(${accent},0.06)`,
      border: `1px solid rgba(${accent},0.12)`,
    }}>
      <p style={{ fontSize: '1rem', fontWeight: 900, color: '#F5F5F7', margin: 0, lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: '0.5rem', fontWeight: 800, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: '0.1rem' }}>{label}</p>
    </div>
  );
}
