'use client';

/**
 * @module jeu/jouer/page
 * « Le pire des quatre » — écran de jeu.
 *
 * Deux corrections de fond par rapport à la version précédente.
 *
 * 1. **La consigne était invisible.** « Votez pour le plus red flag » n'était
 *    affiché qu'une fois, dans une bulle qui s'effaçait au bout de six secondes
 *    au tout premier duel. Passé cela, plus rien à l'écran ne disait ce qu'on
 *    demandait au joueur. La question est désormais permanente, en tête d'écran.
 *
 * 2. **Le face-à-face n'avait pas de sens entre deux comportements anodins.**
 *    Confrontés à deux propositions inoffensives, les joueurs concluaient que le
 *    jeu était cassé. Quatre propositions élargissent l'éventail — il y a
 *    presque toujours un pire relatif — et le dépouillement montre l'échelle de
 *    gravité au lieu de la laisser deviner.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Flame } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useGameStore, type PartySize } from '@/stores/gameStore';
import { useOnlineStatus, useHaptics } from '@/lib/hooks';
import { CategorySelector } from '@/components/game/CategorySelector';
import { FullPageLoading } from '@/components/ui/Loading';
import { Ambient } from './Ambient';
import { RoundBoard } from './RoundBoard';
import { ACCENT, roundVerdict, severityColor, withAlpha } from './verdict';

const AllDuelsExhausted = dynamic(
  () => import('@/components/game/AllDuelsExhausted').then(m => m.AllDuelsExhausted),
  { ssr: false },
);

export default function JouerPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const haptics = useHaptics();
  const [pickedId, setPickedId] = useState<string | null>(null);

  const {
    hasProfile, currentDuel, lastResult, showingResult, streak, duelCount,
    allDuelsExhausted, isLoadingDuel, error, partyActive, partyConfig, partyComplete,
    initializeFromStorage, fetchNextDuel, submitVote, showNextDuel, resetGame,
    clearError, startParty,
  } = useGameStore();

  useEffect(() => { initializeFromStorage(); }, [initializeFromStorage]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!hasProfile) router.push('/jeu'); }, 100);
    return () => clearTimeout(timer);
  }, [hasProfile, router]);

  useEffect(() => {
    if (partyComplete) router.push('/jeu/recap');
  }, [partyComplete, router]);

  // Guard: !error prevents an infinite retry loop when the API fails (429 / 500)
  useEffect(() => {
    if (hasProfile && partyActive && !currentDuel && !isLoadingDuel && !allDuelsExhausted && !error && isOnline) {
      fetchNextDuel();
    }
  }, [hasProfile, partyActive, currentDuel, isLoadingDuel, allDuelsExhausted, error, isOnline, fetchNextDuel]);

  // Le choix local est propre au tour : il se remet à zéro quand la manche
  // suivante s'affiche.
  useEffect(() => { if (!showingResult) setPickedId(null); }, [showingResult, currentDuel]);

  const ranking = lastResult?.ranking ?? [];
  const revealed = showingResult && !lastResult?.isOptimistic && ranking.length > 0;

  const pickedPosition = useMemo(
    () => (revealed && pickedId ? ranking.findIndex(entry => entry.id === pickedId) : -1),
    [revealed, pickedId, ranking],
  );

  const verdict = revealed && pickedPosition >= 0
    ? roundVerdict(pickedPosition, ranking.length, lastResult?.agreement ?? 50)
    : null;

  // Le fond suit la gravité du choix : vif quand le joueur a désigné le pire,
  // apaisé quand il a visé le plus toléré.
  const tint = revealed && pickedPosition >= 0
    ? severityColor(pickedPosition, ranking.length)
    : ACCENT;

  // Le verdict connu, une pression sur les confettis pour les tours réussis.
  const celebrated = useRef<string | null>(null);
  useEffect(() => {
    if (verdict?.tone !== 'hit' || !pickedId || celebrated.current === pickedId) return;
    celebrated.current = pickedId;
    haptics.success();
    import('canvas-confetti')
      .then(({ default: confetti }) => confetti({
        particleCount: 55, spread: 62, origin: { y: 0.3 },
        colors: [ACCENT, '#FB7185', '#FFFFFF'], disableForReducedMotion: true,
      }))
      .catch(() => {});
  }, [verdict?.tone, pickedId, haptics]);

  const handlePick = useCallback((id: string) => {
    if (!currentDuel || showingResult || !isOnline) return;
    haptics.select();
    setPickedId(id);
    const others = currentDuel.elements.filter(e => e.id !== id).map(e => e.id);
    submitVote(id, others);
  }, [currentDuel, showingResult, isOnline, haptics, submitVote]);

  const handleStart = useCallback((categories: string[], size: PartySize) => {
    haptics.tap();
    localStorage.setItem('default_game_categories', JSON.stringify(categories));
    localStorage.setItem('default_game_size', String(size));
    startParty({ size, originalSize: size, categories });
  }, [haptics, startParty]);

  const handleQuit = useCallback(() => { resetGame(); router.push('/jeu'); }, [resetGame, router]);

  if (!hasProfile) return <FullPageLoading text="Chargement..." />;
  if (!partyActive && !partyComplete) return <CategorySelector onStart={handleStart} />;
  if (allDuelsExhausted) return <AllDuelsExhausted duelCount={duelCount} onReset={handleQuit} />;

  if (error && !currentDuel) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#08080C' }}>
        <span className="text-5xl">😕</span>
        <p className="text-sm font-semibold text-white/60">{error}</p>
        <button
          onClick={() => { clearError(); fetchNextDuel(); }}
          className="cursor-pointer rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest text-white"
          style={{ background: ACCENT }}
        >
          Réessayer
        </button>
        <button onClick={handleQuit} className="cursor-pointer text-xs font-bold text-white/40 underline">
          Changer de catégories
        </button>
      </div>
    );
  }

  if (!currentDuel) return <FullPageLoading text="Préparation du tour..." />;

  const progress = partyConfig ? Math.min(100, (duelCount / partyConfig.size) * 100) : 0;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden text-white select-none">
      <Ambient tint={tint} />

      {/* ── Bandeau ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex shrink-0 items-center gap-3 px-4 pt-3 pb-2">
        <Link href="/" aria-label="Retour à l'accueil" className="text-white/30 transition-colors hover:text-white/60">
          <ArrowLeft size={17} />
        </Link>

        {partyConfig && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                style={{ background: ACCENT }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-black tabular-nums text-white/40">
              {duelCount}/{partyConfig.size}
            </span>
          </div>
        )}

        {streak >= 2 && (
          <span
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black tabular-nums"
            style={{ background: withAlpha('#FB7185', 0.16), color: '#FB7185' }}
          >
            <Flame size={11} /> {streak}
          </span>
        )}

        <button onClick={handleQuit} aria-label="Quitter la partie" className="shrink-0 cursor-pointer text-white/25 transition-colors hover:text-white/50">
          <RotateCcw size={15} />
        </button>
      </header>

      {/* ── Consigne ou verdict ──────────────────────────────────────────── */}
      {/* Borné en vh : sur un écran court, le bandeau cède la place aux tuiles
          plutôt que de les comprimer sous leur hauteur utile. */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center px-4 pb-2"
        style={{ minHeight: 'min(92px, 16vh)' }}
      >
        <AnimatePresence mode="wait">
          {showingResult ? (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {verdict ? (
                <>
                  <p
                    className="font-black uppercase leading-[0.92] tracking-[-0.03em]"
                    style={{ fontSize: 'min(2.4rem, 10vw, 5.6vh)', color: tint }}
                  >
                    {verdict.title}
                  </p>
                  <p className="mx-auto mt-2 max-w-[19rem] text-[12px] font-semibold leading-snug text-white/60">
                    {verdict.subtitle}
                  </p>
                </>
              ) : (
                <p className="text-sm font-black uppercase tracking-[0.2em] text-white/35">
                  Dépouillement…
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* Composition en deux temps : la question reste explicite, mais
                  le mot qui porte l'enjeu occupe la place qu'il mérite. */}
              <h1>
                <span className="block text-[11px] font-black uppercase tracking-[0.34em] text-white/40">
                  Lequel est le
                </span>
                <span
                  className="block font-black uppercase leading-[0.85] tracking-[-0.045em]"
                  style={{
                    fontSize: 'min(3.1rem, 13vw, 7vh)',
                    color: ACCENT,
                    textShadow: `0 0 44px ${withAlpha(ACCENT, 0.4)}`,
                  }}
                >
                  Pire&nbsp;?
                </span>
              </h1>
              {/* La phrase qui débloque le jeu : sans elle, quatre comportements
                  anodins donnent l'impression d'une question absurde. */}
              <p className="mx-auto mt-1.5 max-w-[20rem] text-[11.5px] font-semibold leading-snug text-white/45">
                Même si aucun ne te choque vraiment : lequel tu supporterais le moins ?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bulletin ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-3">
        <RoundBoard
          elements={currentDuel.elements}
          pickedId={pickedId}
          ranking={ranking}
          revealed={revealed}
          onPick={handlePick}
          disabled={!isOnline || isLoadingDuel}
        />

        {/* Hauteur réservée : le bouton du dépouillement prend exactement la
            place de l'indication de consigne, les tuiles ne sautent donc pas au
            moment où elles se réordonnent. */}
        <div
          className="mt-2.5 flex shrink-0 items-center justify-center"
          style={{ minHeight: 54, paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}
        >
          {showingResult ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { haptics.tap(); showNextDuel(); }}
              className="w-full cursor-pointer rounded-2xl py-3.5 text-[15px] font-black uppercase tracking-[0.14em]"
              style={{ background: tint, color: '#08080C', boxShadow: `0 8px 30px -6px ${withAlpha(tint, 0.6)}` }}
            >
              {partyConfig && duelCount >= partyConfig.size ? 'Voir le bilan →' : 'Tour suivant →'}
            </motion.button>
          ) : !isOnline ? (
            <p className="text-center text-[11px] font-bold text-red-400">
              📡 Hors ligne — reconnecte-toi pour voter
            </p>
          ) : (
            <span
              className="rounded-full px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-white/40"
              style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              4 comportements · 1 seul à éliminer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
