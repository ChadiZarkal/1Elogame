'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore, type PartyStats, type PartySize } from '@/stores/gameStore';
import { CATEGORIES_CONFIG } from '@/config/categories';

// ── Personality Archetypes (viral hook) ──────────────────────────────────

interface Archetype {
  title: string;
  emoji: string;
  description: string;
  tagline: string; // One-liner for social share
}

function getArchetype(accuracy: number, bestStreak: number, avgReactionMs: number): Archetype {
  // accuracy = correctGuesses / totalDuels (0-1)
  const pct = accuracy * 100;
  const fast = avgReactionMs < 3000;
  const hotStreak = bestStreak >= 5;
  
  if (pct >= 90) {
    if (fast) return {
      title: 'Sniper Absolu',
      emoji: '🎯',
      description: 'Rapide ET précis·e. Tu détectes les red flags en un clin d\'œil. On ne te la fait pas.',
      tagline: 'Sniper Absolu. Je vois les red flags avant qu\'ils n\'existent.',
    };
    return {
      title: 'Radar Absolu',
      emoji: '🛸',
      description: 'Tu vois les red flags avant même qu\'ils existent. Les gens viennent te demander conseil avant un premier date.',
      tagline: 'Radar Absolu. Personne ne peut mentir devant moi.',
    };
  }
  if (pct >= 75) {
    if (fast && hotStreak) return {
      title: 'Instinct de Chasseur·se',
      emoji: '🦊',
      description: 'Réflexes affûtés et intuition redoutable. Tu es la personne qu\'on appelle quand on a un doute sur un date.',
      tagline: 'Instinct de Chasseur·se. Mon intuition ne me trompe jamais.',
    };
    if (hotStreak) return {
      title: 'Machine à Streak',
      emoji: '🔥',
      description: 'Quand tu es lancé·e, rien ne t\'arrête. Ta concentration est impressionnante.',
      tagline: 'Machine à Streak. Quand je suis lancé·e, rien ne m\'arrête.',
    };
    return {
      title: 'Détecteur·rice Pro',
      emoji: '🔍',
      description: 'Tu as un sixième sens pour les red flags. Ton instinct est redoutable — et la communauté est d\'accord avec toi.',
      tagline: 'Détecteur·rice Pro. Mon instinct est redoutable.',
    };
  }
  if (pct >= 60) {
    if (fast) return {
      title: 'Réflexe Instinctif',
      emoji: '⚡',
      description: 'Tu tires vite — parfois juste, parfois non. Ton intuition est bonne mais pourrait être affinée.',
      tagline: 'Réflexe Instinctif. Je tire d\'abord, je réfléchis après.',
    };
    return {
      title: 'Sentinelle',
      emoji: '🛡️',
      description: 'Tu repères la plupart des red flags, mais certains te passent sous le nez. Tu es solidement au-dessus de la moyenne.',
      tagline: 'Sentinelle des red flags. Vigilant·e mais pas infaillible.',
    };
  }
  if (pct >= 45) {
    return {
      title: 'Électron Libre',
      emoji: '🎲',
      description: 'Tes réponses divisent la communauté. Tu as un regard unique sur les comportements — parfois en avance, parfois décalé·e.',
      tagline: 'Électron Libre. Mes opinions divisent la communauté.',
    };
  }
  if (pct >= 30) {
    return {
      title: 'Optimiste Invétéré·e',
      emoji: '🌈',
      description: 'Tu vois le meilleur chez les gens — même quand il n\'y en a pas. C\'est beau, mais risqué.',
      tagline: 'Optimiste Invétéré·e. Je vois du green flag partout.',
    };
  }
  return {
    title: 'Anti-conformiste',
    emoji: '🎭',
    description: 'Tu votes systématiquement à l\'opposé de la majorité. Soit tu es visionnaire, soit tu aimes le chaos.',
    tagline: 'Anti-conformiste. En désaccord avec tout le monde et fier·e de l\'être.',
  };
}

// ── Speed Profile ──────────────────────────────────────────────────────

function getSpeedProfile(avgMs: number): { label: string; emoji: string } {
  if (avgMs < 2000) return { label: 'Instinctif·ve', emoji: '⚡' };
  if (avgMs < 4000) return { label: 'Décidé·e', emoji: '🎯' };
  if (avgMs < 7000) return { label: 'Réfléchi·e', emoji: '🤔' };
  return { label: 'Philosophe', emoji: '🧠' };
}

// ── Stats computation ──────────────────────────────────────────────────

function computeDetailedStats(stats: PartyStats) {
  const totalDuels = stats.results.length;
  const accuracy = totalDuels > 0 ? stats.correctGuesses / totalDuels : 0;
  
  // Average reaction time
  const reactionTimes = stats.results
    .map(r => r.reactionTimeMs)
    .filter((t): t is number => t !== undefined && t > 0);
  const avgReactionMs = reactionTimes.length > 0
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    : 5000;
  
  // Most popular pick (highest % match with community)
  let mostPopular = { text: '', percentage: 0 };
  let mostControversial = { text: '', percentage: 100 };
  
  for (const entry of stats.results) {
    if (entry.result.isOptimistic) continue;
    const pct = entry.result.winner.percentage;
    const text = entry.result.winner.id === entry.duel.elementA.id
      ? entry.duel.elementA.texte
      : entry.duel.elementB.texte;
    
    if (pct > mostPopular.percentage) {
      mostPopular = { text, percentage: pct };
    }
    if (pct < mostControversial.percentage) {
      mostControversial = { text, percentage: pct };
    }
  }
  
  // Category breakdown (which categories user found most "red flag")
  const categoryVotes: Record<string, number> = {};
  for (const entry of stats.results) {
    const winnerId = entry.result.winner.id;
    const winnerElement = winnerId === entry.duel.elementA.id
      ? entry.duel.elementA
      : entry.duel.elementB;
    const cat = winnerElement.categorie;
    categoryVotes[cat] = (categoryVotes[cat] || 0) + 1;
  }
  
  // Duration
  const durationMs = stats.endedAt - stats.startedAt;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  
  // Fastest reaction
  const fastestMs = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
  
  return {
    totalDuels,
    accuracy,
    accuracyPct: Math.round(accuracy * 100),
    avgReactionMs,
    mostPopular,
    mostControversial,
    categoryVotes,
    durationMin,
    durationSec,
    fastestMs,
  };
}

// ── Main Component ──────────────────────────────────────────────────────

export function GameRecap() {
  const router = useRouter();
  const { partyStats, partyConfig, resetGame, startParty, continueParty, profile } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    
    // Fire confetti celebration
    import('canvas-confetti').then(({ default: confetti }) => {
      // Initial burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#A855F7'],
        scalar: 0.9,
        zIndex: 9999,
      });
      // Side bursts for extra celebration
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors: ['#EF4444', '#F97316'], zIndex: 9999 });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ['#10B981', '#3B82F6'], zIndex: 9999 });
      }, 400);
    }).catch(() => {});
  }, []);

  // Redirect if no stats
  useEffect(() => {
    if (!partyStats) {
      router.push('/jeu/jouer');
    }
  }, [partyStats, router]);

  const stats = useMemo(() => {
    if (!partyStats) return null;
    return computeDetailedStats(partyStats);
  }, [partyStats]);

  if (!partyStats || !stats) return null;

  const archetype = getArchetype(
    stats.accuracy,
    partyStats.bestStreak,
    stats.avgReactionMs,
  );
  const speedProfile = getSpeedProfile(stats.avgReactionMs);
  
  const categoryLabel = partyStats.category
    ? CATEGORIES_CONFIG[partyStats.category]?.labelFr || partyStats.category
    : 'Toutes catégories';

  // Share text for viral social sharing
  const shareText = [
    `🚩 Red or Green — Mon profil`,
    ``,
    `${archetype.emoji} ${archetype.title}`,
    `📊 ${stats.accuracyPct}% de précision sur ${stats.totalDuels} duels`,
    `🔥 Best streak : ${partyStats.bestStreak}`,
    `${speedProfile.emoji} Vitesse : ${speedProfile.label} (${(stats.avgReactionMs / 1000).toFixed(1)}s)`,
    ``,
    `« ${archetype.tagline} »`,
    ``,
    `Et toi, quel profil tu aurais ? 👀`,
    `Fais le test → redorgreen.fr/jeu`,
  ].join('\n');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: 'https://redorgreen.fr/jeu?ref=recap' });
      } catch { /* cancelled */ }
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
    if (profile) {
      useGameStore.getState().setProfile(profile);
    }
    router.push('/jeu/jouer');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-8 relative overflow-hidden"
      style={{ background: '#0A0A0B' }}
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 60%)',
        }}
      />

      <div className={`relative z-10 w-full max-w-md space-y-5 ${mounted ? 'animate-fade-in' : ''}`}>
        
        {/* Screenshot prompt */}
        <div className="text-center mb-1">
          <p className="text-xs text-[#71717A] font-medium">
            📸 Screenshot & partage ton profil !
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SHAREABLE CARD — This is the "screenshot zone"                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div
          id="recap-card"
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #141417 0%, #0D0D0F 100%)',
            border: '1.5px solid rgba(239,68,68,0.25)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 pt-5 pb-4 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(239,68,68,0.12) 0%, transparent 100%)',
            }}
          >
            <p className="text-xs font-black tracking-wider text-white mb-3">
              🚩 RED <span className="text-[#EF4444]">OR</span> GREEN
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EF4444] mb-2">
              Résultat de ta partie
            </p>
            <p className="text-5xl mb-2">{archetype.emoji}</p>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
              {archetype.title}
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-[260px] mx-auto">
              {archetype.description}
            </p>
          </div>

          {/* Core Stats Grid */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-2.5">
              {/* Accuracy */}
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: stats.accuracyPct >= 60
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${stats.accuracyPct >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                }}
              >
                <p className="text-2xl font-black text-white">{stats.accuracyPct}%</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] mt-0.5">Précision</p>
              </div>

              {/* Best Streak */}
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <p className="text-2xl font-black text-white">
                  {partyStats.bestStreak}
                  <span className="text-sm ml-0.5">🔥</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] mt-0.5">Best streak</p>
              </div>

              {/* Speed */}
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.15)',
                }}
              >
                <p className="text-2xl font-black text-white">
                  {(stats.avgReactionMs / 1000).toFixed(1)}<span className="text-xs text-[#71717A]">s</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] mt-0.5">{speedProfile.label}</p>
              </div>
            </div>
          </div>

          {/* Party Info bar */}
          <div
            className="mx-5 mb-4 rounded-lg px-3 py-2 flex items-center justify-between"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-[10px] text-[#71717A] font-medium">
              {stats.totalDuels} duels · {categoryLabel}
            </span>
            <span className="text-[10px] text-[#71717A] font-medium">
              {stats.durationMin > 0 ? `${stats.durationMin}min ` : ''}{stats.durationSec}s
            </span>
          </div>

          {/* Highlight: Most popular pick */}
          {stats.mostPopular.text && (
            <div className="mx-5 mb-4">
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.12)',
                }}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#059669] mb-1.5">
                  🎯 Ton choix le plus populaire
                </p>
                <p className="text-sm font-bold text-white leading-snug line-clamp-2">
                  "{stats.mostPopular.text}"
                </p>
                <p className="text-[10px] text-[#6EE7B7] mt-1">
                  {stats.mostPopular.percentage}% de la communauté est d'accord
                </p>
              </div>
            </div>
          )}

          {/* Highlight: Most controversial pick */}
          {stats.mostControversial.text && stats.mostControversial.percentage < 50 && (
            <div className="mx-5 mb-4">
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.12)',
                }}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#EF4444] mb-1.5">
                  🔥 Ton avis le plus clivant
                </p>
                <p className="text-sm font-bold text-white leading-snug line-clamp-2">
                  "{stats.mostControversial.text}"
                </p>
                <p className="text-[10px] text-[#FCA5A5] mt-1">
                  Seulement {stats.mostControversial.percentage}% sont d'accord — tu divises !
                </p>
              </div>
            </div>
          )}

          {/* Tagline for screenshots */}
          <div className="px-5 pb-5">
            <div
              className="rounded-xl p-4 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(124,58,237,0.06) 100%)',
                border: '1px solid rgba(239,68,68,0.12)',
              }}
            >
              <p className="text-sm text-white font-bold italic leading-relaxed">
                « {archetype.tagline} »
              </p>
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="text-[10px] text-[#71717A] font-bold tracking-wider uppercase">
                  redorgreen.fr
                </span>
                <span className="text-[10px]">🚩</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* DETAILS (optional expand)                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors py-2"
        >
          {showDetails ? '▲ Masquer les détails' : '▼ Voir tous les détails'}
        </button>

        {showDetails && (
          <div className="space-y-3 animate-fade-in">
            {/* All duels review */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(20,20,23,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] mb-3">
                Récap duel par duel
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {partyStats.results.map((entry, i) => {
                  const correct = !entry.result.isOptimistic && entry.result.winner.percentage >= 50;
                  const winnerElement = entry.result.winner.id === entry.duel.elementA.id
                    ? entry.duel.elementA : entry.duel.elementB;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}`,
                      }}
                    >
                      <span className="text-xs flex-shrink-0">{correct ? '✅' : '❌'}</span>
                      <p className="text-xs text-white font-medium line-clamp-1 flex-1">
                        {winnerElement.texte}
                      </p>
                      <span className="text-[10px] text-[#71717A] flex-shrink-0">
                        {entry.result.isOptimistic ? '—' : `${entry.result.winner.percentage}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(stats.categoryVotes).length > 1 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(20,20,23,0.9)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] mb-3">
                  Tes votes par catégorie
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.categoryVotes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([catId, count]) => {
                      const cat = CATEGORIES_CONFIG[catId];
                      const pct = Math.round((count / stats.totalDuels) * 100);
                      return (
                        <div key={catId} className="flex items-center gap-2">
                          <span className="text-sm">{cat?.emoji || '📦'}</span>
                          <span className="text-xs text-[#A1A1AA] w-20 truncate">{cat?.labelFr || catId}</span>
                          <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background: cat?.textColor?.includes('FCA5A5') ? '#EF4444'
                                  : cat?.textColor?.includes('C4B5FD') ? '#7C3AED'
                                  : cat?.textColor?.includes('6EE7B7') ? '#059669'
                                  : '#3B82F6',
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[#71717A] w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Speed stats */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(20,20,23,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A] mb-3">
                Vitesse de réaction
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xl font-black text-white">
                    {(stats.avgReactionMs / 1000).toFixed(1)}s
                  </p>
                  <p className="text-[9px] text-[#71717A] uppercase tracking-wider">Moyenne</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white">
                    {stats.fastestMs > 0 ? `${(stats.fastestMs / 1000).toFixed(1)}s` : '—'}
                  </p>
                  <p className="text-[9px] text-[#71717A] uppercase tracking-wider">Plus rapide</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CTAs                                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        
        <div className="space-y-3 pt-2">
          {/* Primary: Share */}
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all duration-200 active:scale-[0.97]"
            style={{
              background: copied
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
              border: `1px solid ${copied ? '#10B981' : '#EF4444'}`,
              color: '#fff',
              boxShadow: copied
                ? '0 8px 32px rgba(16,185,129,0.35)'
                : '0 8px 32px rgba(239,68,68,0.35)',
            }}
          >
            {copied ? '✅ Copié dans le presse-papier !' : '📤 Partager mon profil'}
          </button>

          {/* New party */}
          <button
            onClick={handleNewParty}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F5F5F5',
            }}
          >
            🎯 Nouvelle partie
          </button>

          {/* Continue same party */}
          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#A1A1AA',
            }}
          >
            🔄 Continuer (+{partyConfig?.originalSize || 15} duels de plus)
          </button>

          {/* View rankings */}
          <a
            href="/classement"
            className="block w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all duration-200 active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#FCD34D',
            }}
          >
            🏆 Voir les classements
          </a>

          {/* Secondary links */}
          <div className="flex justify-center gap-4 pt-1">
            <a href="/flagornot" className="text-xs text-[#71717A] hover:text-[#C4B5FD] transition-colors">
              🔮 Oracle
            </a>
            <a href="/" className="text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors">
              🏠 Accueil
            </a>
          </div>
        </div>

        {/* Sociological CTA */}
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            🔬 Tes votes contribuent aux <strong className="text-white">classements communautaires</strong>.
            Découvre ce qui est considéré comme le plus Red Flag selon chaque tranche d'âge et chaque sexe.
          </p>
          <a
            href="/classement"
            className="inline-block mt-2 text-xs text-[#EF4444] hover:text-[#FCA5A5] font-bold transition-colors"
          >
            Explorer les classements →
          </a>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
