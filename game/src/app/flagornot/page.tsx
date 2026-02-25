'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlagOrNot } from './useFlagOrNot';
import { LoadingPhase } from './LoadingPhase';
import { RevealPhase } from './RevealPhase';
import { IdlePhase } from './IdlePhase';

export default function FlagOrNotPage() {
  const router = useRouter();
  const game = useFlagOrNot();

  return (
    <div
      ref={game.mainRef}
      className="relative flex flex-col overflow-hidden"
      style={{ height: 'var(--app-height, 100dvh)', background: '#0A0A0A' }}
    >
      {/* Ambient background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{ background: game.bgGradient }}
        transition={{ duration: 0.7 }}
      />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <button
          onClick={() => router.push('/')}
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          ← Retour
        </button>

        <h1 className="text-base font-bold text-[#FAFAFA] tracking-tight">Oracle</h1>

        {(game.redCount > 0 || game.greenCount > 0) ? (
          <div className="flex items-center gap-2 text-xs min-w-[48px] justify-end font-medium">
            <span className="text-[#EF4444]">🚩 {game.redCount.toLocaleString('fr-FR')}</span>
            <span className="text-[#6B7280]">·</span>
            <span className="text-[#10B981]">🟢 {game.greenCount.toLocaleString('fr-FR')}</span>
          </div>
        ) : (
          <div className="min-w-[48px]" />
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {game.phase === 'loading' && (
            <LoadingPhase
              loadingPhrase={game.loadingPhrase}
              submittedText={game.submittedText}
            />
          )}

          {game.phase === 'reveal' && game.result && (
            <RevealPhase
              result={game.result}
              submittedText={game.submittedText}
              showJustification={game.showJustification}
              isMounted={game.isMounted}
              redCount={game.redCount}
              greenCount={game.greenCount}
              historyLength={game.history.length}
              onShare={game.handleShare}
              onNext={game.handleNext}
            />
          )}

          {game.phase === 'idle' && (
            <IdlePhase
              input={game.input}
              setInput={game.setInput}
              history={game.history}
              communitySubmissions={game.communitySubmissions}
              showCommunityTab={game.showCommunityTab}
              setShowCommunityTab={game.setShowCommunityTab}
              displaySuggestions={game.displaySuggestions}
              placeholderIdx={game.placeholderIdx}
              inputRef={game.inputRef}
              onSubmit={game.handleSubmit}
              onKeyDown={game.handleKeyDown}
              privateMode={game.privateMode}
              setPrivateMode={game.setPrivateMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
