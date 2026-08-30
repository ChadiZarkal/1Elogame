'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { trackAIRequest } from '@/lib/analytics';
import type { GamePhase, JudgmentResult, HistoryItem, CommunitySubmission, FlagOrNotGender, FlagOrNotAge } from './constants';
import { LOADING_PHRASES, PLACEHOLDERS, MIN_LOADING_MS } from './constants';

/**
 * Custom hook encapsulating all Flag or Not game logic.
 * Keeps the page component purely presentational.
 */
export function useFlagOrNot() {
  const [phase, setPhase] = useState<GamePhase>('profile-select');
  const [gender, setGender] = useState<FlagOrNotGender | null>(null);
  const [age, setAge] = useState<FlagOrNotAge | null>(null);
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
  const submittingRef = useRef(false);

  const redCount = globalRedCount;
  const greenCount = globalGreenCount;

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
    /* La hauteur du châssis était pilotée ici, en JavaScript, par une variable
     * `--app-height` posée sur `documentElement` : un maximum qui ne
     * redescendait jamais. Elle figeait donc la fenêtre barre d'URL repliée, si
     * bien qu'au retour de la barre le jeu dépassait l'écran de 60 à 90 px — le
     * dock de saisie et le bouton « Encore » passaient sous la ligne de
     * flottaison. En rotation vers le paysage elle restait à la valeur portrait.
     * Et n'étant jamais retirée au démontage, elle continuait à dimensionner
     * `/jeu`, qui la lisait aussi.
     *
     * `100svh` — la plus petite fenêtre possible, toutes barres déployées —
     * exprime nativement ce que ce code tentait d'approcher : elle ne bouge ni
     * au repli de la barre d'URL ni à l'ouverture du clavier. Voir
     * `FlagornotClient.tsx`. */

    const saved = localStorage.getItem('flagornot_show_justification');
    if (saved !== null) setShowJustification(saved === 'true');

    // Restore profile from localStorage — skip selection if both gender and age are already set
    const savedGender = localStorage.getItem('flagornot_gender');
    const savedAge    = localStorage.getItem('flagornot_age');
    if (
      savedGender && ['homme', 'femme', 'autre'].includes(savedGender) &&
      savedAge    && ['16-18', '19-22', '23-26', '27+'].includes(savedAge)
    ) {
      setGender(savedGender as FlagOrNotGender);
      setAge(savedAge as FlagOrNotAge);
      setPhase('idle');
    }

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
    fetchCommunitySubmissions();
    fetchGlobalCounts();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'flagornot_show_justification' && e.newValue !== null) {
        setShowJustification(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchCommunitySubmissions, fetchGlobalCounts]);

  /* Le verdict s'affichait hors champ, et il fallait remonter pour le lire.
   *
   * Le châssis de jeu ne fait qu'un écran, mais les notes éditoriales et le
   * pied de page sont rendus dessous : le document, lui, est défilable. Pendant
   * la saisie, le clavier virtuel pousse le navigateur à faire défiler la page
   * pour dégager le champ, qui est ancré tout en bas du châssis. Au moment du
   * verdict, `blur()` referme le clavier mais ne rend jamais ces 250 à 400 px :
   * le haut du châssis — donc le verdict — reste au-dessus de la ligne de
   * flottaison. */
  useEffect(() => {
    const frame = mainRef.current;
    if (!frame) return;
    const { top } = frame.getBoundingClientRect();
    // Uniquement quand le châssis est sorti par le haut. Sans cette condition,
    // l'effet se déclencherait aussi au montage et masquerait l'en-tête du
    // site, qu'il faut au contraire laisser en place tant que rien ne l'a
    // chassé.
    if (top >= 0) return;
    window.scrollTo({ top: Math.max(0, top + window.scrollY), behavior: 'auto' });
  }, [phase]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('flagornot_history', JSON.stringify(history.slice(0, 50)));
    }
  }, [history]);

  // Auto-focus disabled to let user read instructions first
  // useEffect(() => {
  //   if (phase === 'idle') {
  //     const t = setTimeout(() => inputRef.current?.focus(), 150);
  //     return () => clearTimeout(t);
  //   }
  // }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((p) => (p + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──
  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    /* Le garde sur `phase` ne suffit pas : `AnimatePresence mode="wait"`
     * maintient l'écran de saisie monté pendant ses 220 ms de sortie, avec les
     * props figées du rendu précédent — donc avec un `phase` encore à `idle`.
     * Un second appui dans cette fenêtre partait en double requête, double
     * écriture en base et double jeton de limitation de débit. Une référence,
     * elle, est lue à la valeur du moment. */
    if (!text || phase !== 'idle' || submittingRef.current) return;
    submittingRef.current = true;

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

    /* La route enchaîne deux fournisseurs d'IA en série et se déclare à 30 s.
     * Sans limite ici, l'écran de chargement pouvait tourner une demi-minute
     * sans compteur ni sortie. Vingt secondes, puis on rend la main. */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch('/api/flagornot/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, private: privateMode, gender, age }),
        signal: controller.signal,
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
      /* Le repli tirait un verdict au hasard et le présentait comme un vrai
       * jugement — enregistré dans l'historique, partageable, indiscernable.
       * Il est désormais marqué comme dégradé pour que l'écran de révélation
       * le dise et propose de réessayer, et il n'entre plus dans l'historique. */
      const fallback: JudgmentResult = {
        verdict: 'red',
        justification: "L'Oracle est injoignable. Rien n'a été analysé — réessaie dans un instant.",
        degraded: true,
      };
      await ensureMinDelay();
      setResult(fallback);
      setPhase('reveal');
      if (navigator.vibrate) navigator.vibrate(40);
    } finally {
      clearTimeout(timeout);
      submittingRef.current = false;
    }
  }, [input, phase, privateMode, gender, age, fetchCommunitySubmissions, fetchGlobalCounts]);

  const handleNext = useCallback(() => {
    // Après un échec de l'Oracle, la saisie est conservée : le bouton devient
    // « Réessayer », et retaper 280 caractères pour relancer serait absurde.
    if (!result?.degraded) setInput('');
    setResult(null);
    setSubmittedText('');
    setPhase('idle');
  }, [result]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

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

  const selectGender = useCallback((g: FlagOrNotGender, a: FlagOrNotAge) => {
    setGender(g);
    setAge(a);
    localStorage.setItem('flagornot_gender', g);
    localStorage.setItem('flagornot_age', a);
    setPhase('idle');
  }, []);

  return {
    // State
    phase,
    gender,
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
    // Gender
    selectGender,
  };
}
