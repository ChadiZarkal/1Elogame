'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Question {
  id?: string;
  text: string;
  timeLimitSec: number;
  options: Array<{ id?: string; text: string; score: 0 | 1 | 2 }>;
}

interface SessionData {
  status: 'pending' | 'in_progress' | 'completed';
  mode: 'local' | 'link';
  sourceType: 'standard' | 'custom';
  subject: { sex: 'homme' | 'femme' | 'autre'; age: number };
  score: { total: number; max: number; answered: number; timedOut: number };
  test: { id?: string; name: string; description?: string | null; questions: Question[] };
  answers: Array<{
    question_index: number;
    question_text: string;
    selected_option: string | null;
    selected_score: 0 | 1 | 2;
    timed_out: boolean;
    time_spent_ms: number;
  }>;
}

function decodeBase64Url(token: string): string {
  const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return atob(padded);
}

function parseInlineSessionFromHash(hash: string): SessionData | null {
  const marker = 'payload=';
  const index = hash.indexOf(marker);
  if (index === -1) return null;

  try {
    const token = hash.slice(index + marker.length);
    const json = decodeBase64Url(token);
    const parsed = JSON.parse(json) as {
      mode: 'local' | 'link';
      sourceType: 'standard' | 'custom';
      subjectSex: 'homme' | 'femme' | 'autre';
      subjectAge: number;
      test: { id?: string; name: string; description?: string | null; questions: Question[] };
    };

    if (!parsed?.test?.questions || !Array.isArray(parsed.test.questions) || parsed.test.questions.length === 0) {
      return null;
    }

    return {
      status: 'pending',
      mode: parsed.mode,
      sourceType: parsed.sourceType,
      subject: {
        sex: parsed.subjectSex,
        age: parsed.subjectAge,
      },
      score: {
        total: 0,
        max: parsed.test.questions.length * 2,
        answered: 0,
        timedOut: 0,
      },
      test: {
        id: parsed.test.id,
        name: parsed.test.name,
        description: parsed.test.description || null,
        questions: parsed.test.questions,
      },
      answers: [],
    };
  } catch {
    return null;
  }
}

function getRiskLabelFromPercent(percent: number): string {
  if (percent >= 70) return 'Alerte rouge';
  if (percent >= 40) return 'Zone de vigilance';
  return 'Plutot rassurant';
}

function formatDurationFromSeconds(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes <= 1) return 'environ 1 minute';
  return `environ ${minutes} minutes`;
}

export default function FlashFlagSessionPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionIndex: number;
    questionText: string;
    selectedOption: string | null;
    selectedScore: 0 | 1 | 2;
    timedOut: boolean;
    timeSpentMs: number;
  }>>([]);
  const [doneSummary, setDoneSummary] = useState<{
    totalScore: number;
    maxScore: number;
    answeredCount: number;
    timedOutCount: number;
    riskPercent: number;
    riskLabel: string;
  } | null>(null);
  const [isInlineMode, setIsInlineMode] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  const startedAtRef = useRef<number>(0);

  const currentQuestion = session?.test.questions[index] || null;
  const totalQuestions = session?.test.questions.length || 0;

  const questionTimeLimitMs = currentQuestion ? currentQuestion.timeLimitSec * 1000 : 0;
  const questionRemainingRatio = questionTimeLimitMs > 0
    ? Math.max(0, Math.min(1, remainingMs / questionTimeLimitMs))
    : 0;
  const timerAccent = questionRemainingRatio <= 0.2 ? '#EF4444' : questionRemainingRatio <= 0.45 ? '#F59E0B' : '#22C55E';
  const timerStrokeOffset = 176 - (176 * questionRemainingRatio);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setCanNativeShare('share' in navigator);
    }
    if (typeof window !== 'undefined') {
      setSessionUrl(window.location.href.split('#')[0]);
    }
  }, [code]);

  const setTemporaryShareFeedback = (message: string) => {
    setShareFeedback(message);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setShareFeedback(''), 2200);
    }
  };

  const copyText = async (value: string, successMessage: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setTemporaryShareFeedback('Copie indisponible sur cet appareil.');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setTemporaryShareFeedback(successMessage);
    } catch {
      setTemporaryShareFeedback('Copie impossible sur cet appareil.');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('payload=')) {
      const inlineSession = parseInlineSessionFromHash(window.location.hash);
      if (inlineSession) {
        setSession(inlineSession);
        setLoading(false);
        setIsInlineMode(true);
        return;
      }
      setError('Lien invalide ou incomplet.');
      setLoading(false);
      return;
    }

    fetch(`/api/flashflag/session/${code}`)
      .then((response) => response.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error?.message || 'Session introuvable');
        setSession(json.data as SessionData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [code]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((index / totalQuestions) * 100);
  }, [index, totalQuestions]);

  const totalEstimatedDuration = useMemo(() => {
    if (!session) return 'environ 1 minute';
    const totalSeconds = session.test.questions.reduce((sum, question) => sum + question.timeLimitSec, 0);
    return formatDurationFromSeconds(totalSeconds);
  }, [session]);

  const resultShareText = useMemo(() => {
    if (doneSummary) {
      return `Je viens de finir Flash Flag (${doneSummary.riskPercent}% - ${doneSummary.riskLabel}). Tu oses le faire en mode chrono ?`;
    }
    if (session?.status === 'completed') {
      const percent = session.score.max > 0 ? Math.round((session.score.total / session.score.max) * 100) : 0;
      return `Resultat Flash Flag: ${percent}% (${getRiskLabelFromPercent(percent)}). A ton tour en mode chrono.`;
    }
    return 'Teste Flash Flag en mode chrono.';
  }, [doneSummary, session]);

  const shareResult = async () => {
    if (!sessionUrl || !canNativeShare || typeof navigator === 'undefined') return;

    try {
      await navigator.share({
        title: 'Flash Flag',
        text: resultShareText,
        url: sessionUrl,
      });
    } catch {
      // Ignore user abort.
    }
  };

  const launch = async () => {
    setError('');

    if (isInlineMode) {
      setStarted(true);
      return;
    }

    try {
      await fetch(`/api/flashflag/session/${code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ started: true }),
      });
      setStarted(true);
    } catch {
      setError('Impossible de lancer la session.');
    }
  };

  const submitAll = useCallback(async (payload: Array<{
    questionIndex: number;
    questionText: string;
    selectedOption: string | null;
    selectedScore: 0 | 1 | 2;
    timedOut: boolean;
    timeSpentMs: number;
  }>) => {
    if (isInlineMode) {
      const answeredCount = payload.filter((item) => !item.timedOut).length;
      const timedOutCount = payload.filter((item) => item.timedOut).length;
      const totalScore = payload.reduce((sum, item) => sum + item.selectedScore, 0);
      const maxScore = (session?.test.questions.length || payload.length) * 2;
      const riskPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const riskLabel = getRiskLabelFromPercent(riskPercent);

      setDoneSummary({
        totalScore,
        maxScore,
        answeredCount,
        timedOutCount,
        riskPercent,
        riskLabel,
      });
      return;
    }

    try {
      const response = await fetch(`/api/flashflag/session/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Soumission impossible');
      setDoneSummary(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur finale');
    }
  }, [code, isInlineMode, session]);

  const pushAnswer = useCallback((selectedOption: string | null, selectedScore: 0 | 1 | 2, timedOut: boolean) => {
    if (!currentQuestion) return;

    const spent = Math.max(0, Date.now() - startedAtRef.current);
    const next = [
      ...answers,
      {
        questionIndex: index,
        questionText: currentQuestion.text,
        selectedOption,
        selectedScore,
        timedOut,
        timeSpentMs: spent,
      },
    ];

    setAnswers(next);

    if (index + 1 >= totalQuestions) {
      submitAll(next);
      return;
    }

    setIndex((value) => value + 1);
  }, [answers, currentQuestion, index, totalQuestions, submitAll]);

  const onTimeout = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 40, 30]);
    }
    pushAnswer(null, 0, true);
  }, [pushAnswer]);

  useEffect(() => {
    if (!started || !currentQuestion || doneSummary) return;

    setRemainingMs(currentQuestion.timeLimitSec * 1000);
    startedAtRef.current = Date.now();

    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 100) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [started, index, currentQuestion, doneSummary, onTimeout]);

  const onSelect = (option: { text: string; score: 0 | 1 | 2 }) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    pushAnswer(option.text, option.score, false);
  };

  if (loading) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
          Chargement de la session...
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <Link href="/flashflag" className="inline-flex min-h-12 min-w-12 items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors active:scale-95">
            <span>←</span>
            <span>Retour preparation</span>
          </Link>
          <div className="rounded-2xl border border-[#7F1D1D] bg-[#1A1212] p-5 text-[#FECACA] shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
          Session absente.
        </div>
      </main>
    );
  }

  if (session.status === 'completed' && !doneSummary) {
    const percent = session.score.max > 0 ? Math.round((session.score.total / session.score.max) * 100) : 0;

    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <Link href="/flashflag" className="inline-flex min-h-12 min-w-12 items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors active:scale-95">
            <span>←</span>
            <span>Retour preparation</span>
          </Link>

          <section className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 space-y-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <h1 className="text-2xl font-black">Resultat deja disponible</h1>
            <p className="text-[#E4E4E7]">Score: {session.score.total}/{session.score.max} ({percent}%)</p>
            <p className="text-[#FCA5A5]">Niveau: {getRiskLabelFromPercent(percent)}</p>
            <p className="text-sm text-[#A3A3A3]">Reponses: {session.score.answered} • Timeout: {session.score.timedOut}</p>

            <div className="rounded-xl border border-white/10 bg-[#17181B] p-4">
              <h2 className="font-bold mb-3">Recap des reponses</h2>
              {session.answers.length === 0 ? (
                <p className="text-sm text-[#A3A3A3]">Aucune reponse detaillee disponible.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {session.answers.map((answer, i) => (
                    <div key={`${answer.question_index}-${i}`} className="rounded-lg border border-white/10 bg-[#111316] p-3">
                      <p className="text-sm text-[#F5F5F5]">Q{answer.question_index + 1}. {answer.question_text}</p>
                      <p className="text-xs text-[#D4D4D8] mt-1">
                        {answer.timed_out
                          ? 'Temps ecoule (0 point)'
                          : `Reponse: ${answer.selected_option || 'Sans selection'} (${answer.selected_score} point${answer.selected_score > 1 ? 's' : ''})`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#15161A] p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">Boucle virale</p>
              <p className="text-sm text-[#E4E4E7]">Partage le challenge et compare les resultats entre potes ou avec ton match.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-[#991B1B] px-3 py-2 text-sm transition-colors hover:bg-[#B91C1C]"
                  onClick={() => copyText(resultShareText, 'Message de challenge copie.')}
                >
                  Copier le message
                </button>
                <button
                  className="rounded-lg bg-[#27272A] px-3 py-2 text-sm transition-colors hover:bg-[#3F3F46]"
                  onClick={() => copyText(sessionUrl, 'Lien de session copie.')}
                >
                  Copier le lien
                </button>
                {canNativeShare && (
                  <button
                    className="rounded-lg bg-[#334155] px-3 py-2 text-sm transition-colors hover:bg-[#475569]"
                    onClick={shareResult}
                  >
                    Partager
                  </button>
                )}
              </div>
              {shareFeedback && <p className="text-xs text-[#86EFAC]">{shareFeedback}</p>}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (doneSummary) {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/4 rounded-full bg-[#F59E0B]/10 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <header className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 space-y-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <h1 className="text-3xl font-black">Test termine</h1>
            <p className="text-[#E4E4E7]">Score red flag: {doneSummary.totalScore}/{doneSummary.maxScore} ({doneSummary.riskPercent}%)</p>
            <p className="text-[#FCA5A5]">Niveau: {doneSummary.riskLabel}</p>
            <p className="text-sm text-[#A3A3A3]">Reponses donnees: {doneSummary.answeredCount} • Timeout: {doneSummary.timedOutCount}</p>
          </header>

          <section className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <h2 className="font-bold mb-3">Recap des reponses</h2>
            <div className="space-y-2">
              {answers.map((answer, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-[#17181B] p-3">
                  <p className="text-sm text-[#F5F5F5]">Q{i + 1}. {answer.questionText}</p>
                  <p className="text-xs text-[#D4D4D8] mt-1">
                    {answer.timedOut
                      ? 'Temps ecoule (0 point)'
                      : `Reponse: ${answer.selectedOption} (${answer.selectedScore} point${answer.selectedScore > 1 ? 's' : ''})`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 space-y-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#A3A3A3]">Defi suivant</p>
            <p className="text-sm text-[#E4E4E7]">Envoie le test a une autre personne et compare les resultats.</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-[#991B1B] px-3 py-2 text-sm transition-colors hover:bg-[#B91C1C]"
                onClick={() => copyText(resultShareText, 'Message de challenge copie.')}
              >
                Copier le message
              </button>
              <button
                className="rounded-lg bg-[#27272A] px-3 py-2 text-sm transition-colors hover:bg-[#3F3F46]"
                onClick={() => copyText(sessionUrl, 'Lien de session copie.')}
              >
                Copier le lien
              </button>
              {canNativeShare && (
                <button
                  className="rounded-lg bg-[#334155] px-3 py-2 text-sm transition-colors hover:bg-[#475569]"
                  onClick={shareResult}
                >
                  Partager
                </button>
              )}
            </div>
            {shareFeedback && <p className="text-xs text-[#86EFAC]">{shareFeedback}</p>}
          </section>

          <Link href="/flashflag" className="inline-flex min-h-12 min-w-12 items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors">
            ← Refaire un test
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0B] text-[#FAFAFA] p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-[#EF4444]/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <Link href="/flashflag" className="inline-flex min-h-12 min-w-12 items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors active:scale-95">
          <span>←</span>
          <span>Retour preparation</span>
        </Link>

        {!started ? (
          <section className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 space-y-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#9CA3AF]">Session Flash Flag</p>
            <h1 className="text-2xl font-black">{session.test.name}</h1>
            {session.test.description && <p className="text-sm text-[#D4D4D8]">{session.test.description}</p>}

            <div className="rounded-xl border border-white/10 bg-[#15161A] p-3 text-sm text-[#E5E7EB]">
              Format ultra simple: la personne repond vite, sans retour arriere, et tu vois si les valeurs sont compatibles.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-[#17181B] p-3">
                <p className="text-[11px] text-[#A3A3A3]">Questions</p>
                <p className="text-sm font-semibold">{session.test.questions.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17181B] p-3">
                <p className="text-[11px] text-[#A3A3A3]">Duree estimee</p>
                <p className="text-sm font-semibold">{totalEstimatedDuration}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17181B] p-3">
                <p className="text-[11px] text-[#A3A3A3]">Mode</p>
                <p className="text-sm font-semibold">{session.mode === 'link' ? 'Invitation' : 'Local'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#7F1D1D] bg-[#1A1212] p-3 text-sm text-[#FECACA]">
              Challenge chrono: pas de retour arriere. Si le temps tombe a zero, c est automatiquement 0 point.
            </div>

            <button
              className="w-full rounded-xl bg-[#EF4444] hover:bg-[#F87171] px-4 py-3 font-bold transition-colors"
              onClick={launch}
            >
              Commencer le test
            </button>
          </section>
        ) : (
          <>
            <header className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#D4D4D8]">Question {index + 1}/{totalQuestions}</p>
                  <p className="mt-1 text-[11px] text-[#A3A3A3]">Avancement du test: {progressPercent}%</p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#18191D] px-3 py-2">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#25262B" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={timerAccent}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="176"
                      strokeDashoffset={timerStrokeOffset}
                      transform="rotate(-90 32 32)"
                    />
                    <text x="32" y="36" textAnchor="middle" fill="#FAFAFA" fontSize="14" fontWeight="700">
                      {(remainingMs / 1000).toFixed(1)}
                    </text>
                  </svg>

                  <div className="min-w-32.5">
                    <p className="text-[11px] text-[#A3A3A3]">Temps restant</p>
                    <p className="text-sm font-semibold" style={{ color: timerAccent }}>
                      {questionRemainingRatio <= 0.2 ? 'Urgence' : questionRemainingRatio <= 0.45 ? 'Depense rapide' : 'Zone confortable'}
                    </p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#25262B]">
                      <div
                        className="h-full transition-[width] duration-75"
                        style={{ width: `${Math.round(questionRemainingRatio * 100)}%`, background: timerAccent }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#202125]">
                <div className="h-full bg-[#EF4444]" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="mt-2 text-[11px]">
                {questionRemainingRatio <= 0.2 ? (
                  <p className="text-[#FCA5A5]">Decision immediate: le chrono est presque a zero.</p>
                ) : questionRemainingRatio <= 0.45 ? (
                  <p className="text-[#FCD34D]">Accroche-toi, le temps file vite.</p>
                ) : (
                  <p className="text-[#86EFAC]">Tu es dans le timing, garde le rythme.</p>
                )}
              </div>
            </header>

            {currentQuestion && (
              <section className="rounded-2xl border border-[#1E1E1E] bg-[#111] p-5 space-y-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
                <h2 className="text-xl font-bold">{currentQuestion.text}</h2>
                <div className="grid gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      className="min-h-14 text-left rounded-lg border border-white/12 bg-[#17181B] px-3 py-3 transition-colors hover:bg-[#1E2024] active:scale-[0.99]"
                      onClick={() => onSelect(option)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-[#A3A3A3]">{idx + 1}</span>
                        <span>{option.text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {error && <p className="text-sm text-[#FCA5A5]">{error}</p>}
      </div>
    </main>
  );
}
