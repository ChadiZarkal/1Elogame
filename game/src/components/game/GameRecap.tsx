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
  tagline: string;
}

function getArchetype(accuracy: number, bestStreak: number, avgReactionMs: number): Archetype {
  const pct = accuracy * 100;
  const fast = avgReactionMs < 3000;
  const hotStreak = bestStreak >= 5;

  if (pct >= 90) {
    if (fast) return { title: 'Sniper Absolu', emoji: '🎯', tagline: 'Je vois les red flags avant qu\'ils n\'existent.' };
    return { title: 'Radar Absolu', emoji: '🛸', tagline: 'Personne ne peut mentir devant moi.' };
  }
  if (pct >= 75) {
    if (fast && hotStreak) return { title: 'Instinct de Chasseur·se', emoji: '🦊', tagline: 'Mon intuition ne me trompe jamais.' };
    if (hotStreak) return { title: 'Machine à Streak', emoji: '🔥', tagline: 'Rien ne m\'arrête.' };
    return { title: 'Détecteur·rice Pro', emoji: '🔍', tagline: 'Mon instinct est redoutable.' };
  }
  if (pct >= 60) {
    if (fast) return { title: 'Réflexe Instinctif', emoji: '⚡', tagline: 'Je tire d\'abord, je réfléchis après.' };
    return { title: 'Sentinelle', emoji: '🛡️', tagline: 'Vigilant·e mais pas infaillible.' };
  }
  if (pct >= 45) return { title: 'Électron Libre', emoji: '🎲', tagline: 'Mes opinions divisent.' };
  if (pct >= 30) return { title: 'Optimiste Invétéré·e', emoji: '🌈', tagline: 'Je vois du green flag partout.' };
  return { title: 'Anti-conformiste', emoji: '🎭', tagline: 'En désaccord avec tout le monde.' };
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

  // Compute correct guesses & best streak from results (avoids race condition bugs)
  let correctGuesses = 0;
  let currentStreak = 0;
  let computedBestStreak = 0;
  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    if (entry.result.winner.percentage >= 50) {
      correctGuesses++;
      currentStreak++;
      computedBestStreak = Math.max(computedBestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  // Use the max of stored and computed to handle any edge case
  const bestStreak = Math.max(stats.bestStreak, computedBestStreak);
  const accuracy = totalDuels > 0 ? correctGuesses / totalDuels : 0;

  const reactionTimes = stats.results
    .map(r => r.reactionTimeMs)
    .filter((t): t is number => t !== undefined && t > 0);
  const avgReactionMs = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 5000;

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

  // Key duels: 3 notable moments with explanatory labels
  type KeyDuel = {
    entry: typeof stats.results[0];
    label: string;
    accent: string;
  };
  const keyDuels: KeyDuel[] = [];
  const nonOptimistic = stats.results.filter(e => !e.result.isOptimistic);

  // 1) Most popular: highest winner percentage (user agreed with the most people)
  const popular = [...nonOptimistic].sort((a, b) => b.result.winner.percentage - a.result.winner.percentage)[0];
  if (popular) {
    keyDuels.push({
      entry: popular,
      label: `💡 D'accord avec ${popular.result.winner.percentage}% des joueurs`,
      accent: '#10B981',
    });
  }

  // 2) Most controversial: where user was most in minority (<50%)
  const minority = [...nonOptimistic]
    .filter(e => e.result.winner.percentage < 50)
    .sort((a, b) => a.result.winner.percentage - b.result.winner.percentage)[0];
  if (minority) {
    keyDuels.push({
      entry: minority,
      label: `😈 Seulement ${minority.result.winner.percentage}% pensent comme toi`,
      accent: '#EF4444',
    });
  }

  // 3) Closest: most 50/50 split (excluding already selected)
  const closest = [...nonOptimistic]
    .filter(e => e !== popular && e !== minority)
    .sort((a, b) => Math.abs(50 - a.result.winner.percentage) - Math.abs(50 - b.result.winner.percentage))[0];
  if (closest) {
    const cp = closest.result.winner.percentage;
    keyDuels.push({
      entry: closest,
      label: `⚖️ Le plus indécis : ${cp}% – ${100 - cp}%`,
      accent: '#F59E0B',
    });
  }

  return {
    totalDuels, accuracy, accuracyPct: Math.round(accuracy * 100),
    bestStreak, avgReactionMs, categoryVotes, keyDuels, correctGuesses,
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

  const archetype = getArchetype(stats.accuracy, stats.bestStreak, stats.avgReactionMs);
  const speedProfile = getSpeedProfile(stats.avgReactionMs);
  const categoryLabel = partyStats.category
    ? CATEGORIES_CONFIG[partyStats.category]?.labelFr || partyStats.category
    : 'Toutes';

  const shareText = [
    `🚩 Red or Green`,
    `${archetype.emoji} ${archetype.title}`,
    `📊 ${stats.accuracyPct}% · 🔥 ${stats.bestStreak} streak · ${speedProfile.emoji} ${(stats.avgReactionMs / 1000).toFixed(1)}s`,
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
            ZONE 1 — HERO CARD (screenshotable)
            Emoji + Title + Tagline + 3 pills. No description.
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
          {/* Logo */}
          <div style={{ padding: '0.7rem 0.75rem 0', textAlign: 'center' }}>
            <img
              src="/logo-rog-new.svg"
              alt="Red or Green"
              style={{ width: 100, height: 'auto', margin: '0 auto 0.15rem', display: 'block', opacity: 0.9 }}
              draggable={false}
            />
          </div>

          {/* Archetype: emoji + title + tagline only (NO description) */}
          <div style={{
            padding: '0.25rem 0.75rem 0.5rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(255,45,45,0.06) 0%, transparent 100%)',
          }}>
            <span style={{ fontSize: '2rem', display: 'block', lineHeight: 1 }}>{archetype.emoji}</span>
            <h1 style={{
              fontSize: '1.1rem', fontWeight: 900, color: '#F5F5F7',
              margin: '0.2rem 0 0.15rem', letterSpacing: '-0.02em',
            }}>
              {archetype.title}
            </h1>
            <p style={{
              fontSize: '0.68rem', color: '#ccc', fontWeight: 700, fontStyle: 'italic',
              margin: 0, lineHeight: 1.35,
            }}>
              « {archetype.tagline} »
            </p>
          </div>

          {/* 3 stat pills — unique location for these numbers */}
          <div style={{ display: 'flex', gap: '0.3rem', padding: '0 0.6rem 0.4rem', justifyContent: 'center' }}>
            <StatPill value={`${stats.accuracyPct}%`} label="Précision" color={stats.accuracyPct >= 60 ? '#10B981' : '#FF6B6B'} />
            <StatPill value={`${stats.bestStreak}`} label="Streak 🔥" color="#FF6B6B" />
            <StatPill value={`${(stats.avgReactionMs / 1000).toFixed(1)}s`} label={speedProfile.label} color="#3B82F6" />
          </div>

          {/* Meta */}
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

        {/* SHARE CTA */}
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

        {/* ══════════════════════════════════════════════════════════════
            ZONE 2 — KEY MOMENTS (2-3 duels with visual bars)
            Explanatory labels + percentage bar with 50% center line
            ══════════════════════════════════════════════════════════════ */}

        {stats.keyDuels.length > 0 && (
          <div style={{ marginTop: '0.7rem' }}>
            <SectionLabel text="Tes moments clés" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {stats.keyDuels.map((kd, i) => {
                const isA = kd.entry.result.winner.id === kd.entry.duel.elementA.id;
                const winnerText = isA ? kd.entry.duel.elementA.texte : kd.entry.duel.elementB.texte;
                const loserText = isA ? kd.entry.duel.elementB.texte : kd.entry.duel.elementA.texte;
                const pct = kd.entry.result.winner.percentage;
                const isCorrect = pct >= 50;

                return (
                  <div key={i} style={{
                    background: '#0C0C0E', borderRadius: 10, padding: '0.5rem 0.6rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {/* Explanatory label */}
                    <p style={{ fontSize: '0.6rem', color: '#999', margin: '0 0 0.35rem', fontWeight: 600, lineHeight: 1.3 }}>
                      {kd.label}
                    </p>

                    {/* Your choice + percentage */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontSize: '0.63rem', color: '#eee', fontWeight: 700,
                        flex: 1, lineHeight: 1.3,
                      }}>
                        {winnerText}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 900, flexShrink: 0,
                        color: isCorrect ? '#10B981' : '#EF4444',
                      }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Visual percentage bar with 50% center line */}
                    <DuelBar percentage={pct} isCorrect={isCorrect} />

                    {/* Other option */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.55rem', color: '#666', flex: 1, lineHeight: 1.3 }}>
                        vs {loserText}
                      </span>
                      <span style={{ fontSize: '0.55rem', color: '#555', flexShrink: 0 }}>
                        {100 - pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ZONE 3 — ALL DUELS (expandable, with visual bars)
            ══════════════════════════════════════════════════════════════ */}

        <button
          onClick={() => setShowAllDuels(!showAllDuels)}
          style={{
            width: '100%', marginTop: '0.5rem', padding: '0.45rem',
            background: '#0C0C0E', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            color: '#777', fontSize: '0.62rem', fontWeight: 700,
          }}
        >
          <span>{showAllDuels ? '▲' : '▼'}</span>
          <span>{showAllDuels ? 'Masquer les duels' : `Voir les ${stats.totalDuels} duels`}</span>
        </button>

        {showAllDuels && (
          <div style={{
            marginTop: '0.35rem', background: '#0C0C0E', borderRadius: 10,
            padding: '0.4rem 0.5rem', border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {partyStats.results.map((entry, i) => {
              const isA = entry.result.winner.id === entry.duel.elementA.id;
              const winnerText = isA ? entry.duel.elementA.texte : entry.duel.elementB.texte;
              const loserText = isA ? entry.duel.elementB.texte : entry.duel.elementA.texte;
              const pct = entry.result.isOptimistic ? null : entry.result.winner.percentage;
              const isCorrect = pct !== null && pct >= 50;

              return (
                <div key={i} style={{
                  padding: '0.35rem 0',
                  borderBottom: i < partyStats.results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  {/* Choice + percentage */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.45rem', color: '#444', fontWeight: 700, width: 16, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.58rem', color: '#bbb', fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                      {winnerText}
                    </span>
                    <span style={{
                      fontSize: '0.55rem', fontWeight: 700, flexShrink: 0,
                      color: isCorrect ? '#6EE7B7' : '#FCA5A5',
                    }}>
                      {pct !== null ? `${pct}%` : '…'}
                    </span>
                  </div>

                  {/* Mini bar */}
                  {pct !== null && (
                    <div style={{ marginLeft: 16, marginTop: '0.12rem' }}>
                      <DuelBar percentage={pct} isCorrect={isCorrect} height={4} />
                    </div>
                  )}

                  {/* VS text */}
                  <p style={{ fontSize: '0.5rem', color: '#555', margin: '0.1rem 0 0', marginLeft: 16, lineHeight: 1.25 }}>
                    vs {loserText}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ACTIONS — Minimal: 2 buttons + link row
            ══════════════════════════════════════════════════════════════ */}

        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
            <button onClick={handleNewParty} style={btnSecondary}>
              🎯 Rejouer
            </button>
            <button onClick={handleContinue} style={btnSecondary}>
              🔄 +{partyConfig?.originalSize || 15} duels
            </button>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.8rem',
            padding: '0.3rem 0',
          }}>
            <a href="/classement" style={linkStyle}>🏆 Classements</a>
            <a href="/flagornot" style={linkStyle}>🔮 Oracle</a>
            <a href="/" style={linkStyle}>🏠 Accueil</a>
          </div>
        </div>
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

/** Horizontal percentage bar with a 50% center line */
function DuelBar({ percentage, isCorrect, height = 8 }: { percentage: number; isCorrect: boolean; height?: number }) {
  const color = isCorrect ? '#10B981' : '#EF4444';
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      background: '#1A1A1A', borderRadius: height / 2, overflow: 'hidden',
    }}>
      {/* Fill */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${percentage}%`,
        background: color,
        borderRadius: height / 2,
        transition: 'width 0.5s ease',
      }} />
      {/* 50% marker */}
      <div style={{
        position: 'absolute', left: '50%', top: -1, bottom: -1,
        width: 1.5, background: 'rgba(255,255,255,0.3)',
        transform: 'translateX(-50%)',
      }} />
    </div>
  );
}

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
