'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, type PartyStats } from '@/stores/gameStore';
import { CATEGORIES_CONFIG } from '@/config/categories';

/* ═══════════════════════════════════════════════════════════════════════
   ARCHETYPE SYSTEM
   ═══════════════════════════════════════════════════════════════════════ */

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
    if (fast) return { title: 'Sniper Absolu', emoji: '🎯', description: 'Rapide ET précis·e. Tu détectes les red flags en un clin d\'œil.', tagline: 'Je vois les red flags avant qu\'ils n\'existent.' };
    return { title: 'Radar Absolu', emoji: '🛸', description: 'Tu vois les red flags avant même qu\'ils existent.', tagline: 'Personne ne peut mentir devant moi.' };
  }
  if (pct >= 75) {
    if (fast && hotStreak) return { title: 'Instinct de Chasseur·se', emoji: '🦊', description: 'Réflexes affûtés et intuition redoutable.', tagline: 'Mon intuition ne me trompe jamais.' };
    if (hotStreak) return { title: 'Machine à Streak', emoji: '🔥', description: 'Quand tu es lancé·e, rien ne t\'arrête.', tagline: 'Rien ne m\'arrête.' };
    return { title: 'Détecteur·rice Pro', emoji: '🔍', description: 'Tu as un sixième sens pour les red flags.', tagline: 'Mon instinct est redoutable.' };
  }
  if (pct >= 60) {
    if (fast) return { title: 'Réflexe Instinctif', emoji: '⚡', description: 'Tu tires vite — parfois juste, parfois non.', tagline: 'Je tire d\'abord, je réfléchis après.' };
    return { title: 'Sentinelle', emoji: '🛡️', description: 'Tu repères la plupart des red flags. Au-dessus de la moyenne.', tagline: 'Vigilant·e mais pas infaillible.' };
  }
  if (pct >= 45) return { title: 'Électron Libre', emoji: '🎲', description: 'Tes réponses divisent la communauté. Un regard unique.', tagline: 'Mes opinions divisent.' };
  if (pct >= 30) return { title: 'Optimiste Invétéré·e', emoji: '🌈', description: 'Tu vois le meilleur chez les gens — même quand il n\'y en a pas.', tagline: 'Je vois du green flag partout.' };
  return { title: 'Anti-conformiste', emoji: '🎭', description: 'Tu votes à l\'opposé de la majorité. Visionnaire ou chaotique.', tagline: 'En désaccord avec tout le monde.' };
}

function getSpeedProfile(avgMs: number): { label: string; emoji: string } {
  if (avgMs < 2000) return { label: 'Instinctif·ve', emoji: '⚡' };
  if (avgMs < 4000) return { label: 'Décidé·e', emoji: '🎯' };
  if (avgMs < 7000) return { label: 'Réfléchi·e', emoji: '🤔' };
  return { label: 'Philosophe', emoji: '🧠' };
}

/* ═══════════════════════════════════════════════════════════════════════
   STATS COMPUTATION
   ═══════════════════════════════════════════════════════════════════════ */

function computeDetailedStats(stats: PartyStats) {
  const totalDuels = stats.results.length;
  const accuracy = totalDuels > 0 ? stats.correctGuesses / totalDuels : 0;

  const reactionTimes = stats.results
    .map(r => r.reactionTimeMs)
    .filter((t): t is number => t !== undefined && t > 0);
  const avgReactionMs = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 5000;

  // Find most popular & most controversial
  let mostPopular = { text: '', percentage: 0 };
  let mostControversial = { text: '', percentage: 100 };

  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    const pct = entry.result.winner.percentage;
    const winnerText = entry.result.winner.id === entry.duel.elementA.id
      ? entry.duel.elementA.texte : entry.duel.elementB.texte;
    if (pct > mostPopular.percentage) mostPopular = { text: winnerText, percentage: pct };
    if (pct < mostControversial.percentage) mostControversial = { text: winnerText, percentage: pct };
  }

  // Category breakdown
  const categoryVotes: Record<string, { total: number; correct: number }> = {};
  for (const entry of stats.results) {
    const winnerId = entry.result.winner.id;
    const winnerEl = winnerId === entry.duel.elementA.id ? entry.duel.elementA : entry.duel.elementB;
    const cat = winnerEl.categorie;
    if (!categoryVotes[cat]) categoryVotes[cat] = { total: 0, correct: 0 };
    categoryVotes[cat].total++;
    if (!entry.result.isOptimistic && entry.result.winner.percentage >= 50) categoryVotes[cat].correct++;
  }

  // Agreement rate
  let agreementCount = 0;
  let nonOptimistic = 0;
  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    nonOptimistic++;
    if (entry.result.winner.percentage >= 50) agreementCount++;
  }
  const agreementRate = nonOptimistic > 0 ? Math.round((agreementCount / nonOptimistic) * 100) : 0;

  const durationMs = stats.endedAt - stats.startedAt;
  const durationSec = Math.floor(durationMs / 1000);
  const fastestMs = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;

  // Key duels: most popular, most controversial, one where user was in minority
  const keyDuels: { entry: typeof stats.results[0]; tag: string; tagColor: string }[] = [];
  const sorted = [...stats.results].filter(e => !e.result.isOptimistic);

  // Find the most consensus duel
  const popular = sorted.sort((a, b) => b.result.winner.percentage - a.result.winner.percentage)[0];
  if (popular) keyDuels.push({ entry: popular, tag: '🎯 + Populaire', tagColor: '#10B981' });

  // Find where user was most in minority
  const minority = sorted.filter(e => e.result.winner.percentage < 50).sort((a, b) => a.result.winner.percentage - b.result.winner.percentage)[0];
  if (minority) keyDuels.push({ entry: minority, tag: '😈 Minoritaire', tagColor: '#EF4444' });

  // Find the closest duel
  const closest = sorted.filter(e => e !== popular && e !== minority).sort((a, b) => Math.abs(50 - a.result.winner.percentage) - Math.abs(50 - b.result.winner.percentage))[0];
  if (closest) keyDuels.push({ entry: closest, tag: '⚖️ Serré', tagColor: '#F59E0B' });

  return {
    totalDuels, accuracy, accuracyPct: Math.round(accuracy * 100),
    avgReactionMs, mostPopular, mostControversial, categoryVotes,
    durationSec, fastestMs, agreementRate, keyDuels,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function GameRecap() {
  const router = useRouter();
  const { partyStats, partyConfig, resetGame, continueParty, profile } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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

  const stats = useMemo(() => partyStats ? computeDetailedStats(partyStats) : null, [partyStats]);

  if (!partyStats || !stats) return null;

  const archetype = getArchetype(stats.accuracy, partyStats.bestStreak, stats.avgReactionMs);
  const speedProfile = getSpeedProfile(stats.avgReactionMs);
  const categoryLabel = partyStats.category
    ? CATEGORIES_CONFIG[partyStats.category]?.labelFr || partyStats.category
    : 'Toutes';

  const shareText = [
    `🚩 Red or Green`,
    `${archetype.emoji} ${archetype.title}`,
    `📊 ${stats.accuracyPct}% · 🔥 ${partyStats.bestStreak} streak · ${speedProfile.emoji} ${(stats.avgReactionMs / 1000).toFixed(1)}s`,
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

  const handleContinue = () => { continueParty(partyConfig?.originalSize ?? 15); router.push('/jeu/jouer'); };
  const handleNewParty = () => {
    resetGame();
    if (profile) useGameStore.getState().setProfile(profile);
    router.push('/jeu/jouer');
  };

  return (
    <div className="hub" style={{ minHeight: '100dvh' }}>
      <div className="hub__texture" aria-hidden="true" />

      <main
        className={`hub__main ${mounted ? 'hub__main--visible' : ''}`}
        style={{ padding: 'clamp(0.6rem, 2.5vw, 1.2rem) 1.25rem 1.5rem' }}
      >
        {/* ══════════════════════════════════════════════════════════════
            ZONE 1 — HERO : Card screenshot + Share CTA
            Must be entirely above the fold (852px viewport)
            ══════════════════════════════════════════════════════════════ */}

        <div
          id="recap-card"
          style={{
            background: 'linear-gradient(180deg, #0E0E11 0%, #0A0A0C 100%)',
            border: '1.5px solid rgba(255,45,45,0.18)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo + Brand */}
          <div style={{ padding: '0.7rem 0.75rem 0', textAlign: 'center' }}>
            <img
              src="/logo-rog-new.svg"
              alt="Red or Green"
              style={{ width: 100, height: 'auto', margin: '0 auto 0.15rem', display: 'block', opacity: 0.9 }}
              draggable={false}
            />
          </div>

          {/* Archetype hero */}
          <div style={{
            padding: '0.25rem 0.75rem 0.5rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(255,45,45,0.06) 0%, transparent 100%)',
          }}>
            <span style={{ fontSize: '2rem', display: 'block', lineHeight: 1 }}>{archetype.emoji}</span>
            <h1 style={{
              fontSize: '1.1rem', fontWeight: 900, color: '#F5F5F7',
              margin: '0.2rem 0 0.1rem', letterSpacing: '-0.02em',
            }}>
              {archetype.title}
            </h1>
            <p style={{ fontSize: '0.62rem', color: '#888', margin: 0, lineHeight: 1.35 }}>
              {archetype.description}
            </p>
          </div>

          {/* 3 stat pills — compact row */}
          <div style={{ display: 'flex', gap: '0.3rem', padding: '0 0.6rem 0.4rem', justifyContent: 'center' }}>
            <StatPill value={`${stats.accuracyPct}%`} label="Précision" color={stats.accuracyPct >= 60 ? '#10B981' : '#FF6B6B'} />
            <StatPill value={`${partyStats.bestStreak}`} label="Streak 🔥" color="#FF6B6B" />
            <StatPill value={`${(stats.avgReactionMs / 1000).toFixed(1)}s`} label={speedProfile.label} color="#3B82F6" />
          </div>

          {/* Tagline — viral quote */}
          <div style={{
            margin: '0 0.6rem 0.5rem', padding: '0.4rem 0.5rem',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(255,45,45,0.04), rgba(124,58,237,0.04))',
            border: '1px solid rgba(255,45,45,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.68rem', color: '#ccc', fontWeight: 700, fontStyle: 'italic', margin: 0, lineHeight: 1.35 }}>
              « {archetype.tagline} »
            </p>
          </div>

          {/* Meta line */}
          <div style={{
            padding: '0.25rem 0.75rem 0.45rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.5rem', color: '#555', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>
              {stats.totalDuels} duels · {categoryLabel}
            </span>
            <span style={{ fontSize: '0.5rem', color: '#444', fontWeight: 800, letterSpacing: '0.12em' }}>
              redorgreen.fr
            </span>
          </div>
        </div>

        {/* SHARE CTA — immediately after card, above fold */}
        <button
          onClick={handleShare}
          style={{
            width: '100%', marginTop: '0.5rem', padding: '0.65rem',
            borderRadius: 10,
            background: copied
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : 'linear-gradient(135deg, #DC2626, #EF4444)',
            border: 'none',
            color: '#fff', fontSize: '0.78rem', fontWeight: 900,
            letterSpacing: '0.05em', textTransform: 'uppercase' as const,
            cursor: 'pointer',
            boxShadow: copied
              ? '0 4px 20px rgba(16,185,129,0.3)'
              : '0 4px 20px rgba(255,45,45,0.3)',
            animation: copied ? 'none' : 'pulse-share 2s infinite',
          }}
        >
          {copied ? '✅ Copié !' : '📤 PARTAGER MON RÉSULTAT'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.55rem', color: '#444', margin: '0.25rem 0 0' }}>
          📸 ou screenshot ta card !
        </p>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 2 — STATS SUMMARY (compact, scannable)
            ══════════════════════════════════════════════════════════════ */}

        <div style={{ marginTop: '0.7rem' }}>
          <SectionLabel text="Ton analyse" />

          {/* Compact 2-col summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            {/* Agreement */}
            <MiniCard>
              <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                🤝 Accord
              </span>
              <span style={{
                fontSize: '1.05rem', fontWeight: 900, lineHeight: 1,
                color: stats.agreementRate >= 60 ? '#10B981' : '#FF6B6B',
              }}>
                {stats.agreementRate}%
              </span>
              <span style={{ fontSize: '0.5rem', color: '#555' }}>
                {stats.agreementRate >= 75 ? 'Très consensuel·le' : stats.agreementRate >= 50 ? 'Dans la norme' : 'Esprit rebelle'}
              </span>
            </MiniCard>

            {/* Speed */}
            <MiniCard>
              <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                ⏱️ Vitesse
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ddd', lineHeight: 1 }}>
                {(stats.avgReactionMs / 1000).toFixed(1)}s
              </span>
              <span style={{ fontSize: '0.5rem', color: '#555' }}>
                moy. · {stats.fastestMs > 0 ? `${(stats.fastestMs / 1000).toFixed(1)}s best` : '—'}
              </span>
            </MiniCard>
          </div>

          {/* Key duels — only 2-3 interesting ones */}
          {stats.keyDuels.length > 0 && (
            <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {stats.keyDuels.map((kd, i) => {
                const isA = kd.entry.result.winner.id === kd.entry.duel.elementA.id;
                const winnerText = isA ? kd.entry.duel.elementA.texte : kd.entry.duel.elementB.texte;
                const loserText = isA ? kd.entry.duel.elementB.texte : kd.entry.duel.elementA.texte;
                const pct = kd.entry.result.winner.percentage;
                return (
                  <div key={i} style={{
                    background: '#0C0C0E', borderRadius: 8, padding: '0.45rem 0.55rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.52rem', fontWeight: 800, color: kd.tagColor }}>{kd.tag}</span>
                      <span style={{ fontSize: '0.52rem', color: '#555', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <div style={{ flex: 1, fontSize: '0.6rem', color: '#ccc', fontWeight: 600, lineHeight: 1.3, borderLeft: '2px solid #FF2D2D', paddingLeft: '0.35rem' }}>
                        {winnerText}
                      </div>
                      <span style={{ fontSize: '0.55rem', color: '#333', alignSelf: 'center', flexShrink: 0 }}>vs</span>
                      <div style={{ flex: 1, fontSize: '0.6rem', color: '#666', fontWeight: 500, lineHeight: 1.3, borderLeft: '2px solid #222', paddingLeft: '0.35rem' }}>
                        {loserText}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ZONE 3 — DETAILS (expandable)
            ══════════════════════════════════════════════════════════════ */}

        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            width: '100%', marginTop: '0.5rem', padding: '0.45rem',
            background: '#0C0C0E', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            color: '#777', fontSize: '0.62rem', fontWeight: 700,
          }}
        >
          <span>{showDetails ? '▲' : '▼'}</span>
          <span>{showDetails ? 'Masquer les détails' : 'Voir tous les détails'}</span>
        </button>

        {showDetails && (
          <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Category breakdown */}
            {Object.keys(stats.categoryVotes).length > 1 && (
              <div style={{ background: '#0C0C0E', borderRadius: 8, padding: '0.5rem 0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.5rem', fontWeight: 800, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: '0 0 0.35rem' }}>
                  📊 Par catégorie
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {Object.entries(stats.categoryVotes)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([catId, data]) => {
                      const cat = CATEGORIES_CONFIG[catId];
                      const pct = Math.round((data.total / stats.totalDuels) * 100);
                      const correctPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                      return (
                        <div key={catId} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.7rem', width: 16, textAlign: 'center' }}>{cat?.emoji || '📦'}</span>
                          <span style={{ fontSize: '0.58rem', color: '#888', width: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat?.labelFr || catId}
                          </span>
                          <div style={{ flex: 1, height: 6, background: '#1A1A1A', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 3, width: `${pct}%`,
                              background: correctPct >= 60 ? '#10B981' : '#EF4444',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.52rem', color: correctPct >= 60 ? '#6EE7B7' : '#FCA5A5', width: 28, textAlign: 'right', fontWeight: 700 }}>
                            {correctPct}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Full duel review */}
            <div style={{ background: '#0C0C0E', borderRadius: 8, padding: '0.5rem 0.6rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.5rem', fontWeight: 800, color: '#555', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: '0 0 0.35rem' }}>
                🆚 Tous les duels ({stats.totalDuels})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {(showAllDuels ? partyStats.results : partyStats.results.slice(0, 5)).map((entry, i) => {
                  const correct = !entry.result.isOptimistic && entry.result.winner.percentage >= 50;
                  const isA = entry.result.winner.id === entry.duel.elementA.id;
                  const winnerText = isA ? entry.duel.elementA.texte : entry.duel.elementB.texte;
                  const loserText = isA ? entry.duel.elementB.texte : entry.duel.elementA.texte;
                  const pct = entry.result.isOptimistic ? null : entry.result.winner.percentage;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.4rem', borderRadius: 5,
                      background: correct ? 'rgba(16,185,129,0.03)' : 'rgba(255,45,45,0.03)',
                      borderLeft: `2px solid ${correct ? '#10B981' : '#EF4444'}`,
                    }}>
                      <span style={{ fontSize: '0.48rem', color: '#444', fontWeight: 700, width: 14, flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.58rem', color: '#bbb', margin: 0, lineHeight: 1.25, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {winnerText}
                        </p>
                        <p style={{ fontSize: '0.5rem', color: '#555', margin: 0, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          vs {loserText}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.5rem', color: correct ? '#6EE7B7' : '#FCA5A5', fontWeight: 700, flexShrink: 0 }}>
                        {pct !== null ? `${pct}%` : '...'}
                      </span>
                    </div>
                  );
                })}
              </div>
              {partyStats.results.length > 5 && (
                <button
                  onClick={() => setShowAllDuels(!showAllDuels)}
                  style={{
                    width: '100%', marginTop: '0.25rem', padding: '0.25rem',
                    background: 'none', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 4, color: '#555', fontSize: '0.52rem', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {showAllDuels ? '▲ Réduire' : `▼ Voir les ${partyStats.results.length} duels`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ACTIONS — Clear hierarchy
            ══════════════════════════════════════════════════════════════ */}

        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {/* Primary: Replay actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            <button onClick={handleNewParty} style={btnSecondary}>
              🎯 Nouvelle partie
            </button>
            <button onClick={handleContinue} style={btnSecondary}>
              🔄 +{partyConfig?.originalSize || 15} duels
            </button>
          </div>

          {/* Tertiary links row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.8rem',
            padding: '0.3rem 0',
          }}>
            <a href="/classement" style={linkStyle}>🏆 Classements</a>
            <a href="/flagornot" style={linkStyle}>🔮 Oracle</a>
            <a href="/" style={linkStyle}>🏠 Accueil</a>
          </div>
        </div>

        {/* Sociological note */}
        <p style={{
          textAlign: 'center', fontSize: '0.5rem', color: '#444', lineHeight: 1.5,
          marginTop: '0.3rem', padding: '0.3rem 0',
        }}>
          🔬 Tes votes alimentent les <strong style={{ color: '#777' }}>classements</strong> par sexe et âge
        </p>
      </main>

      <style>{`
        @keyframes pulse-share {
          0%, 100% { box-shadow: 0 4px 20px rgba(255,45,45,0.3); }
          50% { box-shadow: 0 4px 28px rgba(255,45,45,0.5); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.3rem 0.5rem', borderRadius: 6,
      background: `${color}0F`, border: `1px solid ${color}1F`,
      flex: 1,
    }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#F5F5F7', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: '0.05rem' }}>{label}</span>
    </div>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#0C0C0E', borderRadius: 8, padding: '0.45rem 0.5rem',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', gap: '0.1rem',
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      margin: '0 0 0.35rem',
    }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────────────────── */

const btnSecondary: React.CSSProperties = {
  padding: '0.5rem', borderRadius: 8,
  background: '#0C0C0E',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#bbb', fontSize: '0.65rem', fontWeight: 700,
  cursor: 'pointer',
};

const linkStyle: React.CSSProperties = {
  fontSize: '0.6rem', color: '#555', textDecoration: 'none', fontWeight: 600,
};
