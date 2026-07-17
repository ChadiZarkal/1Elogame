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

type SessionStatus = SessionData['status'];

interface RuntimeAnswer {
  questionIndex: number;
  questionText: string;
  selectedOption: string | null;
  selectedScore: 0 | 1 | 2;
  timedOut: boolean;
  timeSpentMs: number;
}

interface DoneSummary {
  totalScore: number;
  maxScore: number;
  answeredCount: number;
  timedOutCount: number;
  riskPercent: number;
  riskLabel: string;
}

interface PersistedSessionState {
  version: number;
  code: string;
  isInlineMode: boolean;
  started: boolean;
  index: number;
  answers: RuntimeAnswer[];
  doneSummary: DoneSummary | null;
  sessionSnapshot: SessionData | null;
}

const FLASHFLAG_SESSION_STATE_VERSION = 2;
const FLASHFLAG_SESSION_STATE_PREFIX = 'flashflag_session_state_v2:';
const FLASHFLAG_LAST_SESSION_KEY = 'flashflag_last_session_v1';

function buildSessionStateStorageKey(code: string): string {
  return `${FLASHFLAG_SESSION_STATE_PREFIX}${code}`;
}

function clampQuestionIndex(value: number, questionCount: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (questionCount <= 1) return 0;
  return Math.min(Math.floor(value), questionCount - 1);
}

function isRuntimeAnswerArray(value: unknown): value is RuntimeAnswer[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;
    const typed = item as Partial<RuntimeAnswer>;
    return typeof typed.questionIndex === 'number'
      && typeof typed.questionText === 'string'
      && (typed.selectedOption === null || typeof typed.selectedOption === 'string')
      && (typed.selectedScore === 0 || typed.selectedScore === 1 || typed.selectedScore === 2)
      && typeof typed.timedOut === 'boolean'
      && typeof typed.timeSpentMs === 'number';
  });
}

function isDoneSummary(value: unknown): value is DoneSummary {
  if (!value || typeof value !== 'object') return false;
  const typed = value as Partial<DoneSummary>;
  return typeof typed.totalScore === 'number'
    && typeof typed.maxScore === 'number'
    && typeof typed.answeredCount === 'number'
    && typeof typed.timedOutCount === 'number'
    && typeof typed.riskPercent === 'number'
    && typeof typed.riskLabel === 'string';
}

function normalizeSessionStatus(status: unknown): SessionStatus {
  if (status === 'pending' || status === 'in_progress' || status === 'completed') return status;
  return 'pending';
}

function buildLastSessionPayload(input: {
  code: string;
  status: SessionStatus;
  testName: string;
  updatedAt?: number;
}) {
  return {
    code: input.code,
    href: `/flashflag/session/${input.code}`,
    status: input.status,
    testName: input.testName,
    updatedAt: input.updatedAt ?? Date.now(),
  };
}

function decodeBase64Url(token: string): string {
  const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return atob(padded);
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizeFrenchApostrophes(input: string): string {
  return decodeHtmlEntities(input)
    .replace(/[’`]/g, "'")
    .replace(/\b([cdjlmnstCDJLMNST])\s+(?=[aeiouhyAEIOUHY])/g, "$1'")
    .replace(/\b([Qq])u\s+(?=[aeiouhyAEIOUHY])/g, "$1u'")
    .replace(/\b([Ll])orsqu\s+(?=[aeiouhyAEIOUHY])/g, "$1orsqu'")
    .replace(/\b([Pp])uisqu\s+(?=[aeiouhyAEIOUHY])/g, "$1uisqu'")
    .replace(/\b([Jj])usqu\s+(?=[aeiouhyAEIOUHY])/g, "$1usqu'");
}

function createSeedFromCode(code: string): number {
  let hash = 2166136261;
  for (let index = 0; index < code.length; index += 1) {
    hash ^= code.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRandom<T>(items: T[], random: () => number): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function prepareSessionData(source: SessionData, code: string): SessionData {
  const random = createSeededRandom(createSeedFromCode(code));

  const normalizedQuestions = source.test.questions.map((question) => ({
    ...question,
    text: normalizeFrenchApostrophes(question.text),
    options: question.options.map((option) => ({
      ...option,
      text: normalizeFrenchApostrophes(option.text),
    })),
  }));

  const shuffledQuestions = shuffleWithRandom(normalizedQuestions, random).map((question) => ({
    ...question,
    options: shuffleWithRandom(question.options, random),
  }));

  return {
    ...source,
    test: {
      ...source.test,
      questions: shuffledQuestions,
    },
    answers: source.answers.map((answer) => ({
      ...answer,
      question_text: normalizeFrenchApostrophes(answer.question_text),
      selected_option: answer.selected_option ? normalizeFrenchApostrophes(answer.selected_option) : null,
    })),
  };
}

function parseInlineSessionFromHash(hash: string, code: string): SessionData | null {
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

    const sessionData: SessionData = {
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

    return prepareSessionData(sessionData, code);
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
  const [restoredBanner, setRestoredBanner] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [answers, setAnswers] = useState<RuntimeAnswer[]>([]);
  const [doneSummary, setDoneSummary] = useState<DoneSummary | null>(null);
  const [isInlineMode, setIsInlineMode] = useState(false);
  const [hasHydratedState, setHasHydratedState] = useState(false);
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
    if (typeof window === 'undefined') {
      setHasHydratedState(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(buildSessionStateStorageKey(code));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedSessionState>;
        if (parsed.version === FLASHFLAG_SESSION_STATE_VERSION && parsed.code === code) {
          if (parsed.sessionSnapshot) {
            setSession(parsed.sessionSnapshot as SessionData);
            setLoading(false);
          }

          if (typeof parsed.isInlineMode === 'boolean') {
            setIsInlineMode(parsed.isInlineMode);
          }

          if (typeof parsed.started === 'boolean') {
            setStarted(parsed.started);
          }

          if (typeof parsed.index === 'number') {
            setIndex(Math.max(0, Math.floor(parsed.index)));
          }

          if (isRuntimeAnswerArray(parsed.answers)) {
            setAnswers(parsed.answers);
          }

          if (parsed.doneSummary === null || isDoneSummary(parsed.doneSummary)) {
            setDoneSummary(parsed.doneSummary || null);
          }

          setRestoredBanner('Session restauree sur cet appareil.');
        }
      }
    } catch {
      // Ignore invalid persisted payloads.
    } finally {
      setHasHydratedState(true);
    }
  }, [code]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setCanNativeShare('share' in navigator);
    }
    if (typeof window !== 'undefined') {
      setSessionUrl(window.location.href.split('#')[0]);
    }
  }, [code]);

  useEffect(() => {
    if (!hasHydratedState || !session || typeof window === 'undefined') return;

    const safeIndex = clampQuestionIndex(index, session.test.questions.length);
    if (safeIndex !== index) {
      setIndex(safeIndex);
      return;
    }

    const payload: PersistedSessionState = {
      version: FLASHFLAG_SESSION_STATE_VERSION,
      code,
      isInlineMode,
      started,
      index: safeIndex,
      answers,
      doneSummary,
      sessionSnapshot: session,
    };

    try {
      window.localStorage.setItem(buildSessionStateStorageKey(code), JSON.stringify(payload));

      const currentStatus = doneSummary
        ? 'completed'
        : (started ? 'in_progress' : normalizeSessionStatus(session.status));

      window.localStorage.setItem(
        FLASHFLAG_LAST_SESSION_KEY,
        JSON.stringify(buildLastSessionPayload({ code, status: currentStatus, testName: session.test.name })),
      );
    } catch {
      // Ignore localStorage write failures.
    }
  }, [hasHydratedState, session, code, isInlineMode, started, index, answers, doneSummary]);

  useEffect(() => {
    if (!restoredBanner) return;
    if (typeof window === 'undefined') return;

    const timeout = window.setTimeout(() => setRestoredBanner(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [restoredBanner]);

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
    if (!hasHydratedState) return;

    if (typeof window !== 'undefined' && window.location.hash.includes('payload=')) {
      const inlineSession = parseInlineSessionFromHash(window.location.hash, code);
      if (inlineSession) {
        setSession((prev) => prev || inlineSession);
        setLoading(false);
        setIsInlineMode(true);
        return;
      }
      setError('Lien invalide ou incomplet.');
      setLoading(false);
      return;
    }

    let active = true;

    fetch(`/api/flashflag/session/${code}`, { cache: 'no-store' })
      .then((response) => response.json().then((json) => ({ ok: response.ok, json })))
      .then(({ ok, json }) => {
        if (!ok || !json.success) throw new Error(json.error?.message || 'Session introuvable');
        if (!active) return;

        const loaded = prepareSessionData(json.data as SessionData, code);
        setSession(loaded);
        setError('');

        if (loaded.status === 'completed') {
          setStarted(false);
          setIndex(0);
          setAnswers((prev) => {
            if (prev.length > 0) return prev;
            return loaded.answers.map((answer) => ({
              questionIndex: answer.question_index,
              questionText: answer.question_text,
              selectedOption: answer.selected_option,
              selectedScore: answer.selected_score,
              timedOut: answer.timed_out,
              timeSpentMs: answer.time_spent_ms,
            }));
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erreur');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [code, hasHydratedState]);

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

  const submitAll = useCallback(async (payload: RuntimeAnswer[]) => {
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
      setStarted(false);
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
    <main className="relative min-h-dvh overflow-hidden bg-[#080809] text-[#FAFAFA] p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_15px,rgba(255,255,255,0.35)_15px,rgba(255,255,255,0.35)_16px)] opacity-[0.03]" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/14 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-[#F59E0B]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <Link href="/flashflag" className="inline-flex min-h-12 min-w-12 items-center gap-2 rounded-lg px-2 text-sm text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-colors active:scale-95">
          <span>←</span>
          <span>Retour preparation</span>
        </Link>

        {restoredBanner && (
          <div className="rounded-xl border border-[#14532D] bg-[#052E1F]/75 px-4 py-2 text-xs text-[#86EFAC]">
            {restoredBanner}
          </div>
        )}

        {!started ? (
          <section className="rounded-3xl border border-[#2B2B2D] bg-[linear-gradient(125deg,#101012_0%,#161619_58%,#2A1318_100%)] p-5 space-y-4 shadow-[0_20px_70px_rgba(0,0,0,0.38)]">
            <p className="inline-flex w-fit rounded-full border border-[#7F1D1D] bg-[#2A1519] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FCA5A5]">Sprint Flash Flag</p>
            <h1 className="text-3xl font-black leading-tight">{session.test.name}</h1>
            {session.test.description && <p className="text-sm text-[#D4D4D8]">{session.test.description}</p>}

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-[#E5E7EB]">
              Format ultra simple: la personne repond vite, sans retour arriere, et tu vois si les valeurs sont compatibles.
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-[#A3A3A3]">Questions</p>
                <p className="text-sm font-semibold">{session.test.questions.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-[#A3A3A3]">Duree estimee</p>
                <p className="text-sm font-semibold">{totalEstimatedDuration}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-[#A3A3A3]">Mode</p>
                <p className="text-sm font-semibold">{session.mode === 'link' ? 'Invitation' : 'Local'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#7F1D1D] bg-[#1A1212]/85 p-3 text-sm text-[#FECACA]">
              Challenge chrono: pas de retour arriere. Si le temps tombe a zero, c est automatiquement 0 point.
            </div>

            <button
              className="w-full rounded-xl bg-[#EF4444] hover:bg-[#F87171] px-4 py-3 font-bold transition-colors"
              onClick={launch}
            >
              {session.status === 'in_progress' ? 'Reprendre le sprint' : 'Commencer le sprint'}
            </button>

            <p className="text-xs text-[#A3A3A3]">En cas de refresh ou de changement d onglet, la progression reprend automatiquement sur cet appareil.</p>
          </section>
        ) : (
          <>
            <header className="sticky top-3 z-20 rounded-2xl border border-[#2B2B2D] bg-[#121315]/95 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.3)] backdrop-blur">
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
              <section className="rounded-3xl border border-[#2B2B2D] bg-[linear-gradient(145deg,#111214_0%,#17181B_100%)] p-5 space-y-4 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#A3A3A3]">Decision en mode instinct</p>
                <h2 className="text-xl font-bold leading-snug">{currentQuestion.text}</h2>
                <div className="grid gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      className="group min-h-14 text-left rounded-xl border border-white/12 bg-[#17181B] px-3 py-3 transition-colors hover:border-[#EF4444]/55 hover:bg-[#1F2024] active:scale-[0.99]"
                      onClick={() => onSelect(option)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs text-[#A3A3A3] group-hover:border-[#FCA5A5] group-hover:text-[#FCA5A5]">{idx + 1}</span>
                        <span className="text-[#F5F5F5]">{option.text}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-[#A3A3A3]">Astuce: reponds au premier ressenti. C est justement le but du sprint.</p>
              </section>
            )}
          </>
        )}

        {error && <p className="text-sm text-[#FCA5A5]">{error}</p>}
      </div>
    </main>
  );
}
