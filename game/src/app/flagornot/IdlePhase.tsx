'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import type { HistoryItem, CommunitySubmission } from './constants';
import { PLACEHOLDERS } from './constants';

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
  return (
    <motion.div
      key="idle"
      className="flex-1 flex flex-col min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        {/* Header icons */}
        <motion.div
          className="text-5xl mb-4 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚩
          </motion.span>
          <span className="text-[#4B5563] text-3xl font-thin">ou</span>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            🟢
          </motion.span>
        </motion.div>

        <h2 className="text-[28px] sm:text-[32px] font-black text-[#FAFAFA] text-center mb-2">
          Oracle
        </h2>
        <p className="text-[#6B7280] text-sm text-center mb-4 max-w-xs">
          Écris un comportement ou une situation et découvre le verdict : red flag ou green flag.
        </p>

        {/* Tabs: Mon historique / D'autres ont testé */}
        {(history.length > 0 || communitySubmissions.length > 0) && (
          <motion.div
            className="mt-3 w-full max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Tab buttons — only when both have data */}
            {history.length > 0 && communitySubmissions.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShowCommunityTab(false)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                    !showCommunityTab
                      ? 'bg-[#FAFAFA]/10 text-[#FAFAFA] border border-[#FAFAFA]/20'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  📋 Mon historique ({history.length})
                </button>
                <button
                  onClick={() => setShowCommunityTab(true)}
                  className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all ${
                    showCommunityTab
                      ? 'bg-[#FAFAFA]/10 text-[#FAFAFA] border border-[#FAFAFA]/20'
                      : 'text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  👥 D&apos;autres ont testé ({communitySubmissions.length})
                </button>
              </div>
            )}

            {/* Single label when only one has data */}
            {history.length > 0 && communitySubmissions.length === 0 && (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
                  📋 Mon historique
                </span>
                <span className="flex-1 h-px bg-[#1E1E1E]" />
              </div>
            )}
            {history.length === 0 && communitySubmissions.length > 0 && (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">
                  👥 D&apos;autres ont testé
                </span>
                <span className="flex-1 h-px bg-[#1E1E1E]" />
              </div>
            )}

            {/* Tab content: Mon historique */}
            {!showCommunityTab && history.length > 0 && (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-hide">
                {history.slice(0, 10).map((h, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setInput(h.text)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111] border border-[#1A1A1A] hover:border-[#333] transition-all text-left group cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                  >
                    <span
                      className={`text-xs flex-shrink-0 ${h.verdict === 'red' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}
                    >
                      {h.verdict === 'red' ? '🚩' : '🟢'}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF] group-hover:text-[#D1D5DB] truncate flex-1 transition-colors">
                      {h.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Tab content: D'autres ont testé */}
            {(showCommunityTab || history.length === 0) && communitySubmissions.length > 0 && (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-hide">
                {communitySubmissions.slice(0, 10).map((sub, i) => (
                  <motion.button
                    key={sub.id || i}
                    onClick={() => setInput(sub.text)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111] border border-[#1A1A1A] hover:border-[#333] transition-all text-left group cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                  >
                    <span
                      className={`text-xs flex-shrink-0 ${sub.verdict === 'red' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}
                    >
                      {sub.verdict === 'red' ? '🚩' : '🟢'}
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

      {/* Bottom input zone */}
      <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
        {/* Input + send */}
        <div className="flex gap-2.5 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              maxLength={280}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              enterKeyHint="send"
              className="w-full pl-4 pr-[52px] py-[14px] bg-[#141414] border border-[#1E1E1E] rounded-2xl text-[#FAFAFA] text-base placeholder:text-[#3D3D3D] focus:outline-none focus:border-[#EF4444]/40 focus:shadow-[0_0_25px_rgba(239,68,68,0.08)] transition-all duration-200"
              style={{ fontSize: '16px' }}
              aria-label="Écris un comportement à analyser"
            />
            {input.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#3D3D3D] tabular-nums">
                {input.length}
              </span>
            )}
          </div>

          <motion.button
            onClick={onSubmit}
            disabled={!input.trim()}
            className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-none text-white font-bold disabled:opacity-15 disabled:cursor-not-allowed active:scale-90 transition-all duration-200 ${
              input.trim()
                ? 'bg-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : 'bg-[#1A1A1A]'
            }`}
            whileTap={input.trim() ? { scale: 0.85 } : {}}
            aria-label="Envoyer"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Privacy toggle */}
        <button
          type="button"
          onClick={() => setPrivateMode(!privateMode)}
          className="mt-2.5 flex items-center gap-2 w-full group"
          aria-pressed={privateMode}
        >
          <span
            className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
              privateMode
                ? 'bg-[#6B7280] border-[#6B7280]'
                : 'bg-transparent border-[#333] group-hover:border-[#555]'
            }`}
          >
            {privateMode && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className={`text-[11px] transition-colors ${
            privateMode ? 'text-[#9CA3AF]' : 'text-[#4B5563] group-hover:text-[#6B7280]'
          }`}>
            Ne pas partager dans l&apos;historique communautaire
          </span>
        </button>
      </div>
    </motion.div>
  );
}
