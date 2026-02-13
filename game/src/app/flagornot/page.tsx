'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

type GamePhase = 'idle' | 'loading' | 'reveal';

interface JudgmentResult {
  verdict: 'red' | 'green';
  justification: string;
}

interface HistoryItem extends JudgmentResult {
  text: string;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const SUGGESTIONS = [
  { emoji: '📱', text: 'Il regarde ton téléphone' },
  { emoji: '☀️', text: 'Elle te dit bonjour chaque matin' },
  { emoji: '❤️', text: 'Il like les photos de son ex' },
  { emoji: '☕', text: 'Elle te prépare un café' },
  { emoji: '❌', text: 'Il annule au dernier moment' },
  { emoji: '👋', text: 'Elle te présente à ses amis' },
  { emoji: '🔇', text: 'Il répond pas pendant 3h' },
  { emoji: '🎁', text: 'Elle te fait des surprises' },
  { emoji: '👀', text: 'Il check tes stories en premier' },
  { emoji: '🧠', text: 'Elle se souvient de tes goûts' },
  { emoji: '🚪', text: 'Il part sans dire au revoir' },
  { emoji: '💬', text: 'Elle prend de tes nouvelles' },
];

const LOADING_PHRASES = [
  "L'IA analyse ton truc… 🔍",
  'Hmm, laisse-moi réfléchir… 🤔',
  'Consultation du tribunal des flags… ⚖️',
  "C'est chaud là, je calcule… 🔥",
  'Le verdict arrive… 🧠',
  "L'IA délibère… ⏳",
  'Ça sent le flag… 👃',
  'Analyse comportementale en cours… 🤖',
];

const PLACEHOLDERS = [
  '"Il regarde ton téléphone…"',
  '"Elle te dit je t\'aime en premier…"',
  '"Il met 3 jours à répondre…"',
  '"Elle se souvient de ton plat préféré…"',
  '"Il parle de son ex au 1er date…"',
  '"Elle te prépare des surprises…"',
  '"Il te follow/unfollow sur Insta…"',
  '"Elle rit à toutes tes blagues…"',
];

const MIN_LOADING_MS = 900;

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function FlagOrNotPage() {
  const router = useRouter();

  // ═══ State ═══
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [input, setInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [result, setResult] = useState<JudgmentResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // ═══ Refs ═══
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // ═══ Derived ═══
  const redCount = useMemo(() => history.filter((h) => h.verdict === 'red').length, [history]);
  const greenCount = useMemo(() => history.filter((h) => h.verdict === 'green').length, [history]);

  // ═══ Effects ═══

  // [Iter 4] Viewport height fix — mobile keyboards
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };
    updateHeight();
    window.visualViewport?.addEventListener('resize', updateHeight);
    window.addEventListener('resize', updateHeight);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // [Iter 10] Auto-focus when going back to idle
  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // [Iter 6] Cycle placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ═══ Handlers ═══

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || phase !== 'idle') return;

    // [Iter 27] Dismiss keyboard for more screen space
    inputRef.current?.blur();

    setSubmittedText(text);
    setPhase('loading');
    setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/flagornot/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('API error');
      const data: JudgmentResult = await res.json();

      // [Iter 13] Minimum loading for dramatic suspense
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }

      setResult(data);
      setHistory((prev) => [{ ...data, text }, ...prev].slice(0, 50));
      setPhase('reveal');

      // [Iter 23] Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(data.verdict === 'red' ? [80, 40, 80] : [60]);
      }
    } catch {
      const fallback: JudgmentResult = {
        verdict: Math.random() > 0.5 ? 'red' : 'green',
        justification: "L'IA a bugué… mais on a deviné quand même 😅",
      };

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }

      setResult(fallback);
      setHistory((prev) => [{ ...fallback, text }, ...prev].slice(0, 50));
      setPhase('reveal');
      if (navigator.vibrate) navigator.vibrate(40);
    }
  }, [input, phase]);

  const handleNext = useCallback(() => {
    setResult(null);
    setInput('');
    setSubmittedText('');
    setPhase('idle');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ═══ Background ═══

  const bgGradient = useMemo(() => {
    if (phase === 'reveal' && result) {
      return result.verdict === 'red'
        ? 'radial-gradient(ellipse at 50% 25%, rgba(239,68,68,0.18) 0%, #0A0A0A 65%)'
        : 'radial-gradient(ellipse at 50% 25%, rgba(16,185,129,0.18) 0%, #0A0A0A 65%)';
    }
    if (phase === 'loading') {
      return 'radial-gradient(ellipse at 50% 50%, rgba(120,120,120,0.06) 0%, #0A0A0A 65%)';
    }
    return 'radial-gradient(ellipse at 50% 60%, rgba(50,50,50,0.08) 0%, #0A0A0A 70%)';
  }, [phase, result]);

  // ═══ Render ═══

  return (
    <div
      ref={mainRef}
      className="relative flex flex-col overflow-hidden"
      style={{ height: 'var(--app-height, 100dvh)', background: '#0A0A0A' }}
    >
      {/* ═══ [Iter 20] Ambient background layer ═══ */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{ background: bgGradient }}
        transition={{ duration: 0.7 }}
      />

      {/* ═══ [Iter 21] Top bar ═══ */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <button
          onClick={() => router.push('/')}
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          ← Retour
        </button>

        <h1 className="text-base font-bold text-[#FAFAFA] tracking-tight">
          🚩 ou 🟢 ?
        </h1>

        {/* [Iter 25] Score pill */}
        {history.length > 0 ? (
          <div className="flex items-center gap-2 text-xs min-w-[48px] justify-end font-medium">
            <span className="text-[#EF4444]">🚩 {redCount}</span>
            <span className="text-[#6B7280]">·</span>
            <span className="text-[#10B981]">🟢 {greenCount}</span>
          </div>
        ) : (
          <div className="min-w-[48px]" />
        )}
      </div>

      {/* ═══ Main content area ═══ */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {/* ─────────────────────────── */}
          {/* ─── LOADING STATE ──────── */}
          {/* ─────────────────────────── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              className="flex-1 flex flex-col items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.25 }}
            >
              {/* [Iter 11] Pulsing orb with red/green alternation */}
              <div className="relative w-28 h-28 mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    background: [
                      'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)',
                      'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)',
                      'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)',
                    ],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(239,68,68,0.2)',
                      '0 0 60px rgba(16,185,129,0.2)',
                      '0 0 40px rgba(239,68,68,0.2)',
                    ],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-5xl"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🤖
                </motion.div>
              </div>

              {/* [Iter 14] Loading phrase */}
              <motion.p
                className="text-[#9CA3AF] text-lg text-center font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {loadingPhrase}
              </motion.p>

              {/* [Iter 15] Animated dots */}
              <div className="flex gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    animate={{
                      backgroundColor: ['#4B5563', '#EF4444', '#10B981', '#4B5563'],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>

              {/* The submitted text */}
              <motion.p
                className="text-[#4B5563] text-sm italic mt-8 text-center max-w-[280px]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                &quot;{submittedText}&quot;
              </motion.p>
            </motion.div>
          )}

          {/* ─────────────────────────── */}
          {/* ─── REVEAL STATE ────────── */}
          {/* ─────────────────────────── */}
          {phase === 'reveal' && result && (
            <motion.div
              key="reveal"
              className="flex-1 flex flex-col items-center px-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* [Iter 16, 20] Particles burst */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {Array.from({ length: 14 }).map((_, i) => {
                  const angle = (i / 14) * 360 + Math.random() * 20;
                  const rad = (angle * Math.PI) / 180;
                  const dist = 90 + Math.random() * 100;
                  const redEmojis = ['🚩', '💀', '😱', '⛔', '🔥', '💔', '😬'];
                  const greenEmojis = ['🟢', '✨', '💚', '🌟', '🎉', '💫', '🥳'];
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-[30%] text-lg"
                      style={{ marginLeft: '-9px', marginTop: '-9px' }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(rad) * dist,
                        y: Math.sin(rad) * dist,
                        opacity: 0,
                        scale: 0.15,
                        rotate: Math.random() * 400 - 200,
                      }}
                      transition={{ duration: 1.1, delay: 0.15 + i * 0.03, ease: 'easeOut' }}
                    >
                      {result.verdict === 'red'
                        ? redEmojis[i % redEmojis.length]
                        : greenEmojis[i % greenEmojis.length]}
                    </motion.span>
                  );
                })}
              </div>

              {/* Main verdict content — centered */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md">
                {/* [Iter 17] Big emoji with heavy spring */}
                <motion.div
                  className="text-[96px] sm:text-[112px] leading-none mb-2"
                  initial={{ scale: 0, rotate: -25, y: -60 }}
                  animate={{ scale: 1, rotate: 0, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 12,
                    delay: 0.05,
                  }}
                >
                  {result.verdict === 'red' ? '🚩' : '🟢'}
                </motion.div>

                {/* [Iter 18] Verdict text with glow */}
                <motion.h2
                  className={`text-[40px] sm:text-5xl font-black tracking-tight mb-5 ${
                    result.verdict === 'red' ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}
                  initial={{ opacity: 0, y: 25, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 20 }}
                  style={{
                    textShadow:
                      result.verdict === 'red'
                        ? '0 0 50px rgba(239,68,68,0.4), 0 0 100px rgba(239,68,68,0.15)'
                        : '0 0 50px rgba(16,185,129,0.4), 0 0 100px rgba(16,185,129,0.15)',
                  }}
                >
                  {result.verdict === 'red' ? 'RED FLAG' : 'GREEN FLAG'}
                </motion.h2>

                {/* [Iter 28] Original text */}
                <motion.p
                  className="text-[#9CA3AF] text-base italic text-center mb-5 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  &quot;{submittedText}&quot;
                </motion.p>

                {/* [Iter 19] Justification card — auto-shown with glass effect */}
                <motion.div
                  className="w-full rounded-2xl p-5 text-center glass"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  style={{
                    border: `1px solid ${
                      result.verdict === 'red'
                        ? 'rgba(239,68,68,0.2)'
                        : 'rgba(16,185,129,0.2)'
                    }`,
                  }}
                >
                  <p className="text-[#D1D5DB] text-[15px] leading-relaxed">
                    {result.justification}
                  </p>
                </motion.div>
              </div>

              {/* [Iter 24] "Encore!" button — bottom, big, thumb-friendly */}
              <motion.div
                className="w-full max-w-md pb-[max(16px,env(safe-area-inset-bottom))] pt-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                <motion.button
                  onClick={handleNext}
                  className={`
                    w-full py-[18px] rounded-2xl font-bold text-[17px] text-white
                    active:scale-[0.97] transition-transform
                    ${
                      result.verdict === 'red'
                        ? 'bg-[#EF4444] shadow-[0_0_35px_rgba(239,68,68,0.35)]'
                        : 'bg-[#10B981] shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  Encore ! 🔥
                </motion.button>
              </motion.div>

              {/* [Iter 34] Progress bar */}
              {history.length > 1 && (
                <motion.div
                  className="w-full max-w-md pb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="h-1 rounded-full bg-[#1A1A1A] overflow-hidden flex">
                    <motion.div
                      className="h-full bg-[#EF4444]"
                      animate={{ width: `${(redCount / history.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.div
                      className="h-full bg-[#10B981]"
                      animate={{ width: `${(greenCount / history.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─────────────────────────── */}
          {/* ─── IDLE STATE ──────────── */}
          {/* ─────────────────────────── */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              className="flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* [Iter 1, 5] Center content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
                <motion.div
                  className="text-6xl mb-3"
                  animate={{
                    rotate: [0, -6, 6, -3, 0],
                    scale: [1, 1.06, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🤔
                </motion.div>

                <h2 className="text-[28px] sm:text-[32px] font-black text-[#FAFAFA] text-center mb-3">
                  Demande à L&apos;IA
                </h2>

                {/* [Iter 33] History pills — recent judgments */}
                {history.length > 0 && (
                  <motion.div
                    className="mt-5 flex flex-wrap gap-1.5 justify-center max-w-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {history.slice(0, 5).map((h, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2.5 py-1 rounded-full border ${
                          h.verdict === 'red'
                            ? 'border-[#EF4444]/15 text-[#EF4444]/60 bg-[#EF4444]/5'
                            : 'border-[#10B981]/15 text-[#10B981]/60 bg-[#10B981]/5'
                        }`}
                      >
                        {h.verdict === 'red' ? '🚩' : '🟢'} {h.text.slice(0, 22)}
                        {h.text.length > 22 ? '…' : ''}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* ─── [Iter 1, 3] Bottom input zone ─── */}
              <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                {/* [Iter 7, 29] Suggestions — horizontal snap scroll */}
                {!input && (
                  <motion.div
                    className="mb-3 -mx-4 px-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(s.text)}
                          className="
                            flex-none snap-start
                            flex items-center gap-1.5
                            text-[12px] px-3 py-2.5 rounded-xl
                            bg-[#141414] border border-[#1E1E1E]
                            text-[#9CA3AF]
                            hover:border-[#EF4444]/30 hover:text-[#FAFAFA]
                            active:scale-[0.96] active:bg-[#1A1A1A]
                            transition-all duration-150
                            whitespace-nowrap
                          "
                        >
                          <span className="text-sm">{s.emoji}</span>
                          <span>{s.text}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* [Iter 8, 9] Input field + send button */}
                <div className="flex gap-2.5 items-center">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={PLACEHOLDERS[placeholderIdx]}
                      maxLength={280}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      enterKeyHint="send"
                      className="
                        w-full pl-4 pr-[52px] py-[14px]
                        bg-[#141414] border border-[#1E1E1E]
                        rounded-2xl text-[#FAFAFA] text-base
                        placeholder:text-[#3D3D3D]
                        focus:outline-none focus:border-[#EF4444]/40
                        focus:shadow-[0_0_25px_rgba(239,68,68,0.08)]
                        transition-all duration-200
                      "
                      style={{ fontSize: '16px' }}
                    />

                    {/* Character count */}
                    {input.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#3D3D3D] tabular-nums">
                        {input.length}
                      </span>
                    )}
                  </div>

                  {/* [Iter 8] Send button — large touch target */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className={`
                      w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-none
                      text-white font-bold
                      disabled:opacity-15 disabled:cursor-not-allowed
                      active:scale-90
                      transition-all duration-200
                      ${
                        input.trim()
                          ? 'bg-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                          : 'bg-[#1A1A1A]'
                      }
                    `}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
