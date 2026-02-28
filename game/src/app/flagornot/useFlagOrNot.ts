'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { trackAIRequest } from '@/lib/analytics';
import type { GamePhase, JudgmentResult, HistoryItem, CommunitySubmission } from './constants';
import { LOADING_PHRASES, PLACEHOLDERS, MIN_LOADING_MS, FALLBACK_SUGGESTIONS } from './constants';

/**
 * Custom hook encapsulating all Flag or Not game logic.
 * Keeps the page component purely presentational.
 */
export function useFlagOrNot() {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [input, setInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [result, setResult] = useState<JudgmentResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [showJustification, setShowJustification] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunitySubmission[]>([]);
  const [showCommunityTab, setShowCommunityTab] = useState(false);
  const [globalRedCount, setGlobalRedCount] = useState(0);
  const [globalGreenCount, setGlobalGreenCount] = useState(0);
  const [privateMode, setPrivateMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const redCount = globalRedCount;
  const greenCount = globalGreenCount;

  const displaySuggestions = useMemo(() => {
    if (communitySubmissions.length >= 4) {
      return communitySubmissions.slice(0, 12).map((s) => ({
        emoji: s.emoji,
        text: s.text,
        isCommunity: true,
        timeAgo: s.timeAgo,
      }));
    }
    return FALLBACK_SUGGESTIONS.map((s) => ({ ...s, isCommunity: false, timeAgo: '' }));
  }, [communitySubmissions]);

  // ── Fetch community ──
  const fetchCommunitySubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/flagornot/community?limit=20');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data?.submissions) {
        setCommunitySubmissions(data.data.submissions);
      }
    } catch {
      /* silent */
    }
  }, []);

  // ── Fetch global verdict counts ──
  const fetchGlobalCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/flagornot/counts');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        setGlobalRedCount(data.data.red ?? 0);
        setGlobalGreenCount(data.data.green ?? 0);
      }
    } catch {
      /* silent */
    }
  }, []);

  // ── Init effects ──
  useEffect(() => {
    let stableHeight = 0;

    const updateHeight = () => {
      // Use innerHeight which is stable across keyboard open/close on iOS.
      // Only allow height to grow (never shrink when keyboard opens).
      const vh = window.innerHeight;
      if (vh > stableHeight || stableHeight === 0) {
        stableHeight = vh;
        document.documentElement.style.setProperty('--app-height', `${stableHeight}px`);
      }
    };

    const saved = localStorage.getItem('flagornot_show_justification');
    if (saved !== null) setShowJustification(saved === 'true');

    const savedHistory = localStorage.getItem('flagornot_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 50));
      } catch {
        /* ignore */
      }
    }

    setIsMounted(true);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    fetchCommunitySubmissions();
    fetchGlobalCounts();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'flagornot_show_justification' && e.newValue !== null) {
        setShowJustification(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchCommunitySubmissions, fetchGlobalCounts]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('flagornot_history', JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);

  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──
  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || phase !== 'idle') return;

    inputRef.current?.blur();
    setSubmittedText(text);
    setPhase('loading');
    setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    trackAIRequest();

    const startTime = Date.now();
    const ensureMinDelay = async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }
    };

    try {
      const res = await fetch('/api/flagornot/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, private: privateMode }),
      });
      if (!res.ok) throw new Error('API error');
      const data: JudgmentResult = await res.json();

      await ensureMinDelay();
      setResult(data);
      setHistory((prev) => [{ ...data, text }, ...prev].slice(0, 50));
      setPhase('reveal');

      const justifSetting = localStorage.getItem('flagornot_show_justification');
      if (justifSetting !== null) setShowJustification(justifSetting === 'true');

      if (navigator.vibrate) {
        navigator.vibrate(data.verdict === 'red' ? [80, 40, 80] : [60]);
      }
      fetchCommunitySubmissions();
      fetchGlobalCounts();
    } catch {
      const fallback: JudgmentResult = {
        verdict: Math.random() > 0.5 ? 'red' : 'green',
        justification: "L'Oracle a bugué… mais on a deviné quand même 😅",
      };
      await ensureMinDelay();
      setResult(fallback);
      setHistory((prev) => [{ ...fallback, text }, ...prev].slice(0, 50));
      setPhase('reveal');
      if (navigator.vibrate) navigator.vibrate(40);
    }
  }, [input, phase, privateMode, fetchCommunitySubmissions, fetchGlobalCounts]);

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

  const handleShare = useCallback(async () => {
    if (!result || !submittedText) return;
    const shareText = `${result.verdict === 'red' ? '🚩 RED FLAG' : '🟢 GREEN FLAG'}: "${submittedText}" — Teste toi aussi sur Red or Green !`;
    const shareUrl = `https://redorgreen.fr/flagornot?ref=share`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Red or Green — Oracle', text: shareText, url: shareUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    }
  }, [result, submittedText]);

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

  return {
    // State
    phase,
    input,
    setInput,
    submittedText,
    result,
    history,
    loadingPhrase,
    placeholderIdx,
    showJustification,
    isMounted,
    communitySubmissions,
    showCommunityTab,
    setShowCommunityTab,
    redCount,
    greenCount,
    displaySuggestions,
    bgGradient,
    // Refs
    inputRef,
    mainRef,
    // Handlers
    handleSubmit,
    handleNext,
    handleKeyDown,
    handleShare,
    // Privacy
    privateMode,
    setPrivateMode,
  };
}
