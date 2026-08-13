'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { HistoryItem, CommunitySubmission } from './constants';
import { PLACEHOLDERS } from './constants';
import { MAX_FLAGORNOT_TEXT_LENGTH } from '@/config/constants';

interface IdlePhaseProps {
  input: string;
  setInput: (v: string) => void;
  history: HistoryItem[];
  communitySubmissions: CommunitySubmission[];
  showCommunityTab: boolean;
  setShowCommunityTab: (v: boolean) => void;
  displaySuggestions: { emoji: string; text: string; isCommunity: boolean; timeAgo: string }[];
  placeholderIdx: number;
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  privateMode: boolean;
  setPrivateMode: (v: boolean) => void;
}

export function IdlePhase({
  input,
  setInput,
  history,
  communitySubmissions,
  showCommunityTab,
  setShowCommunityTab,
  placeholderIdx,
  inputRef,
  onSubmit,
  onKeyDown,
  privateMode,
  setPrivateMode,
}: IdlePhaseProps) {
  const handleVoiceClick = () => {
    toast('🎙️ Non disponible pour l\'instant', {
      description: 'La saisie vocale arrive bientôt !',
      duration: 2500,
    });
  };

  const hasHistory = history.length > 0;
  const hasCommunity = communitySubmissions.length > 0;

  return (
    <motion.div
      key="idle"
      className="flex-1 flex flex-col min-h-0 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.22 }}
    >
      {/* Background aurora */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 15%, rgba(139,92,246,0.10) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 oracle-bg-dots opacity-8 pointer-events-none" />

      {/* Central content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 min-h-0 relative z-10 pb-2">

        {/* Oracle icon */}
        <motion.div
          className="flex items-center justify-center mb-3"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        >
          <motion.span
            className="text-[44px] animate-oracle-float"
            style={{ display: 'block', lineHeight: 1 }}
          >
            🔮
          </motion.span>
        </motion.div>

        <motion.h2
          className="text-[22px] font-black text-center mb-1 tracking-tight oracle-gradient-text"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Soumets ton cas
        </motion.h2>
        <motion.p
          className="text-[12px] text-[#6B7280] text-center mb-5 max-w-55 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          Décris un comportement — l&apos;Oracle rend son verdict.
        </motion.p>

        {/* History / community */}
        {(hasHistory || hasCommunity) && (
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            {/* Tabs (both have data) */}
            {hasHistory && hasCommunity && (
              <div
                className="flex gap-1 mb-3 p-1 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={() => setShowCommunityTab(false)}
                  className={`flex-1 text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
                    !showCommunityTab
                      ? 'bg-white/10 text-white'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  📋 Mon histo ({history.length})
                </button>
                <button
                  onClick={() => setShowCommunityTab(true)}
                  className={`flex-1 text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
                    showCommunityTab
                      ? 'bg-white/10 text-white'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  👥 Communauté ({communitySubmissions.length})
                </button>
              </div>
            )}

            {/* Solo labels */}
            {hasHistory && !hasCommunity && (
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] mb-2.5">📋 Mon historique</p>
            )}
            {!hasHistory && hasCommunity && (
              <p className="text-[10px] font-black uppercase tracking-widest text-[#4B5563] mb-2.5">👥 D&apos;autres ont testé</p>
            )}

            {/* History list */}
            {!showCommunityTab && hasHistory && (
              <div className="space-y-1.5 max-h-37 overflow-y-auto scrollbar-hide">
                {history.slice(0, 10).map((h, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setInput(h.text)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left group cursor-pointer transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.022 }}
                    whileHover={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`text-sm shrink-0 ${h.verdict === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {h.verdict === 'red' ? '🚩' : '✅'}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF] group-hover:text-[#D1D5DB] truncate flex-1 transition-colors">
                      {h.text}
                    </span>
                    <span className={`text-[9px] font-black shrink-0 ${h.verdict === 'red' ? 'text-red-600' : 'text-emerald-700'}`}>
                      {h.verdict === 'red' ? 'RED' : 'GREEN'}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Community list */}
            {(showCommunityTab || !hasHistory) && hasCommunity && (
              <div className="space-y-1.5 max-h-37 overflow-y-auto scrollbar-hide">
                {communitySubmissions.slice(0, 10).map((sub, i) => (
                  <motion.button
                    key={sub.id || i}
                    onClick={() => setInput(sub.text)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left group cursor-pointer transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.022 }}
                    whileHover={{ borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`text-sm shrink-0 ${sub.verdict === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {sub.verdict === 'red' ? '🚩' : '✅'}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF] group-hover:text-[#D1D5DB] truncate flex-1 transition-colors">
                      {sub.text}
                    </span>
                    <span className="text-[9px] text-[#3D3D3D] flex-shrink-0">{sub.timeAgo}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom input dock */}
      <div className="relative z-10 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <motion.div
          className="rounded-3xl overflow-hidden oracle-glass"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          {/* Text input */}
          <div className="px-4 pt-4 pb-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              maxLength={MAX_FLAGORNOT_TEXT_LENGTH}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              enterKeyHint="send"
              className="w-full bg-transparent text-[#FAFAFA] placeholder:text-[#3A3A50] focus:outline-none leading-relaxed"
              style={{ fontSize: '16px' }}
              aria-label="Écris un comportement à analyser"
            />
            {input.length > 0 && (
              <p className="text-[10px] text-[#3A3A50] mt-0.5 tabular-nums text-right">
                {input.length}/{MAX_FLAGORNOT_TEXT_LENGTH}
              </p>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
            {/* Privacy toggle */}
            <button
              type="button"
              onClick={() => setPrivateMode(!privateMode)}
              className="flex items-center gap-1.5 group min-h-9"
              aria-pressed={privateMode}
            >
              <span
                className={`w-3.75 h-3.75 rounded shrink-0 flex items-center justify-center border transition-all ${`
                  privateMode
                    ? 'bg-violet-600 border-violet-500'
                    : 'bg-transparent border-[#333] group-hover:border-[#555]'
                }`}
              >
                {privateMode && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={`text-[10px] transition-colors ${
                privateMode ? 'text-violet-400' : 'text-[#4B5563] group-hover:text-[#6B7280]'
              }`}>
                🔒 Privé
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* Voice button */}
              <motion.button
                onClick={handleVoiceClick}
                whileTap={{ scale: 0.86 }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all animate-mic-pulse"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1.5px solid rgba(139,92,246,0.28)',
                  color: '#8B5CF6',
                }}
                aria-label="Saisie vocale (bientôt disponible)"
              >
                {/* Microphone SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </motion.button>

              {/* Send button */}
              <motion.button
                onClick={onSubmit}
                disabled={!input.trim()}
                whileTap={input.trim() ? { scale: 0.87 } : {}}
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #7C3AED 0%, #0891B2 100%)'
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: input.trim() ? '0 0 22px rgba(124,58,237,0.42)' : 'none',
                }}
                aria-label="Envoyer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}


