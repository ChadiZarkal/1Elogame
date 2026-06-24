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
    displaySuggestions,
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
      className="relative flex flex-col overflow-hidden"
      style={{ height: 'var(--app-height, 100dvh)', background: '#0A0A0A' }}
    >
      {/* Ambient background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{ background: bgGradient }}
        transition={{ duration: 0.7 }}
      />

      {/* Top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <Link
          href="/"
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          ← Retour
        </Link>

        <h1 className="text-base font-bold text-[#FAFAFA] tracking-tight">Oracle</h1>

        {(redCount > 0 || greenCount > 0) ? (
          <div className="flex items-center gap-2 text-xs min-w-[48px] justify-end font-medium">
            <Link href="/flagornot/stats" className="text-[#6B7280] hover:text-[#FAFAFA] transition-colors" aria-label="Stats">📊</Link>
            <span className="text-[#EF4444]">🚩 {redCount.toLocaleString('fr-FR')}</span>
            <span className="text-[#6B7280]">·</span>
            <span className="text-[#10B981]">🟢 {greenCount.toLocaleString('fr-FR')}</span>
          </div>
        ) : (
          <div className="min-w-[48px] flex justify-end">
            <Link href="/flagornot/stats" className="text-[#6B7280] hover:text-[#FAFAFA] transition-colors text-sm" aria-label="Stats">📊</Link>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {phase === 'gender-select' && (
            <GenderSelect onSelect={selectGender} />
          )}

          {phase === 'loading' && (
            <LoadingPhase
              loadingPhrase={loadingPhrase}
              submittedText={submittedText}
            />
          )}

          {phase === 'reveal' && result && (
            <RevealPhase
              result={result}
              submittedText={submittedText}
              showJustification={showJustification}
              isMounted={isMounted}
              redCount={redCount}
              greenCount={greenCount}
              historyLength={history.length}
              onShare={handleShare}
              onNext={handleNext}
            />
          )}

          {phase === 'idle' && (
            <IdlePhase
              input={input}
              setInput={setInput}
              history={history}
              communitySubmissions={communitySubmissions}
              showCommunityTab={showCommunityTab}
              setShowCommunityTab={setShowCommunityTab}
              displaySuggestions={displaySuggestions}
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
