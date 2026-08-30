'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useFlagOrNot } from './useFlagOrNot';
import { LoadingPhase } from './LoadingPhase';
import { RevealPhase } from './RevealPhase';
import { IdlePhase } from './IdlePhase';
import { GenderSelect } from './GenderSelect';

export default function FlagOrNotPage() {
  const {
    mainRef,
    bgGradient,
    redCount,
    greenCount,
    phase,
    selectGender,
    loadingPhrase,
    submittedText,
    result,
    showJustification,
    isMounted,
    history,
    handleShare,
    handleNext,
    input,
    setInput,
    communitySubmissions,
    showCommunityTab,
    setShowCommunityTab,
    placeholderIdx,
    inputRef,
    handleSubmit,
    handleKeyDown,
    privateMode,
    setPrivateMode,
  } = useFlagOrNot();

  return (
    <div
      ref={mainRef}
      /* Cible du lien d'évitement du gabarit racine : `/flagornot` était l'une
         des rares routes à ne pas la définir, et le lien n'y menait nulle part. */
      id="main-content"
      tabIndex={-1}
      className="relative flex flex-col overflow-hidden"
      /* `svh` : la plus petite fenêtre possible, toutes barres déployées. Elle
         ne bouge ni au repli de la barre d'URL ni à l'ouverture du clavier —
         ce que la variable `--app-height`, pilotée en JavaScript, tentait
         d'approximer en ne sachant que grandir. Voir `useFlagOrNot`. */
      style={{ height: 'calc(100svh - var(--header-h,3rem))', background: '#06040F' }}
    >
      {/* Ambiance : `absolute` et non `fixed`.
          Ce conteneur a une hauteur d'écran et le contenu éditorial le suit
          dans le flux. En `fixed`, ces deux dégradés couvraient toute la page
          — le texte se lisait à travers un voile violet et une trame de points,
          illisible au téléphone. Bornés au conteneur, ils restent l'ambiance du
          jeu et s'arrêtent où le jeu s'arrête. */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        animate={{ background: bgGradient }}
        transition={{ duration: 0.7 }}
      />

      {/* Cosmic dot grid */}
      <div className="absolute inset-0 pointer-events-none z-0 oracle-bg-dots opacity-[0.07]" />

      {/* Subtle top ambient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)' }}
      />

      {/* ── Top bar ── */}
      {/* Plus de `env(safe-area-inset-top)` : l'en-tête du site est rendu
          au-dessus de ce châssis et dégage déjà l'encoche. Le cumul ajoutait
          47 px de vide en haut du jeu sur iPhone. */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3.5 pb-2">
        {/* Back */}
        <Link
          href="/"
          className="text-[#4B5563] hover:text-white transition-colors flex items-center gap-1.5 min-w-11 min-h-11 justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-[15px]">🔮</span>
          <h1
            className="text-[14px] font-black tracking-widest oracle-gradient-text"
          >
            L&apos;ORACLE
          </h1>
        </div>

        {/* Stats */}
        {(redCount > 0 || greenCount > 0) ? (
          <div className="flex items-center gap-2 min-w-20 justify-end">
            <Link
              href="/flagornot/stats"
              /* La surface cliquable se reduisait au SVG de 15 px, soit un
                 tiers du minimum de 44. Les marges negatives elargissent la
                 cible sans deplacer l'icone. */
              className="-m-2 flex min-h-11 min-w-11 items-center justify-center text-[#4B5563] hover:text-white transition-colors"
              aria-label="Voir les statistiques"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </Link>
            <span className="text-[11px] font-bold text-red-400">🚩 {redCount.toLocaleString('fr-FR')}</span>
            <span className="text-[11px] font-bold text-emerald-400">✅ {greenCount.toLocaleString('fr-FR')}</span>
          </div>
        ) : (
          <div className="min-w-11 flex justify-end">
            <Link
              href="/flagornot/stats"
              /* La surface cliquable se reduisait au SVG de 15 px, soit un
                 tiers du minimum de 44. Les marges negatives elargissent la
                 cible sans deplacer l'icone. */
              className="-m-2 flex min-h-11 min-w-11 items-center justify-center text-[#4B5563] hover:text-white transition-colors"
              aria-label="Voir les statistiques"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Thin separator */}
      <div
        className="relative z-20 h-px mx-4"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.2) 50%, transparent 100%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {phase === 'profile-select' && (
            <GenderSelect key="profile" onSelect={selectGender} />
          )}

          {phase === 'loading' && (
            <LoadingPhase
              key="loading"
              loadingPhrase={loadingPhrase}
              submittedText={submittedText}
            />
          )}

          {phase === 'reveal' && result && (
            <RevealPhase
              key="reveal"
              result={result}
              submittedText={submittedText}
              showJustification={showJustification}
              isMounted={isMounted}
              redCount={redCount}
              greenCount={greenCount}
              onShare={handleShare}
              onNext={handleNext}
            />
          )}

          {phase === 'idle' && (
            <IdlePhase
              key="idle"
              input={input}
              setInput={setInput}
              history={history}
              communitySubmissions={communitySubmissions}
              showCommunityTab={showCommunityTab}
              setShowCommunityTab={setShowCommunityTab}
              placeholderIdx={placeholderIdx}
              inputRef={inputRef}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              privateMode={privateMode}
              setPrivateMode={setPrivateMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
