'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

type SubjectSex = 'homme' | 'femme' | 'autre';
type SourceType = 'standard' | 'custom';
type Mode = 'local' | 'link';

interface StandardTest {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
}

interface CustomQuestion {
  text: string;
  timeLimitSec: number;
  options: Array<{ text: string; score: 0 | 1 | 2 }>;
}

interface SessionWatchAnswer {
  question_index: number;
  question_text: string;
  selected_option: string | null;
  selected_score: 0 | 1 | 2;
  timed_out: boolean;
  time_spent_ms: number;
}

interface SessionWatchData {
  status: 'pending' | 'in_progress' | 'completed';
  score: {
    total: number;
    max: number;
    answered: number;
    timedOut: number;
  };
  test?: {
    name: string;
  };
  answers: SessionWatchAnswer[];
}

const CUSTOM_MIN_QUESTIONS = 5;
const CUSTOM_MAX_QUESTIONS = 20;
const CUSTOM_DRAFT_KEY = 'flashflag_custom_draft_v2';

const defaultQuestion = (): CustomQuestion => ({
  text: '',
  timeLimitSec: 7,
  options: [
    { text: '', score: 0 },
    { text: '', score: 2 },
  ],
});

const createSchema = z.object({
  subjectAge: z.number().int().min(16).max(99),
});

function encodePayloadToBase64Url(payload: unknown): string {
  const text = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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

function normalizeScore(value: unknown): 0 | 1 | 2 {
  if (value === 0 || value === 1 || value === 2) return value;
  return 1;
}

function normalizeCustomQuestions(input: unknown): CustomQuestion[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const q = item as Partial<CustomQuestion>;
      if (typeof q.text !== 'string') return null;
      if (!Array.isArray(q.options)) return null;

      const options = q.options
        .map((opt) => {
          if (!opt || typeof opt !== 'object') return null;
          const typedOpt = opt as { text?: unknown; score?: unknown };
          if (typeof typedOpt.text !== 'string') return null;
          return {
            text: typedOpt.text,
            score: normalizeScore(typedOpt.score),
          };
        })
        .filter((opt): opt is { text: string; score: 0 | 1 | 2 } => opt !== null)
        .slice(0, 3);

      if (options.length < 2) return null;

      const time = Number(q.timeLimitSec);
      return {
        text: q.text,
        timeLimitSec: Number.isFinite(time) ? Math.min(30, Math.max(3, Math.round(time))) : 7,
        options,
      } satisfies CustomQuestion;
    })
    .filter((item): item is CustomQuestion => item !== null);
}

export default function FlashFlagPage() {
  const router = useRouter();

  const [subjectSex, setSubjectSex] = useState<SubjectSex>('homme');
  const [subjectAge, setSubjectAge] = useState<number>(25);
  const [sourceType, setSourceType] = useState<SourceType>('standard');
  const [mode, setMode] = useState<Mode>('local');

  const [tests, setTests] = useState<StandardTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  const [customName, setCustomName] = useState('Test perso rapide');
  const [customDescription, setCustomDescription] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(
    Array.from({ length: CUSTOM_MIN_QUESTIONS }, () => defaultQuestion()),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState('');
  const [createdSessionCode, setCreatedSessionCode] = useState('');
  const [watchData, setWatchData] = useState<SessionWatchData | null>(null);
  const [watchError, setWatchError] = useState('');

  const selectedStandardTest = useMemo(
    () => tests.find((test) => test.id === selectedTestId) || null,
    [tests, selectedTestId],
  );

  const customEstimatedDuration = useMemo(() => {
    const totalSeconds = customQuestions.reduce((sum, question) => sum + question.timeLimitSec, 0);
    return formatDurationFromSeconds(totalSeconds);
  }, [customQuestions]);

  useEffect(() => {
    fetch('/api/flashflag/tests')
      .then((response) => response.json())
      .then((json) => {
        const list = (json.data?.tests || []) as StandardTest[];
        if (list.length === 0) {
          setTests([]);
          setSelectedTestId('');
          setError('Aucun test standard actif disponible pour le moment.');
          return;
        }

        setTests(list);
        setSelectedTestId(list[0].id);
      })
      .catch(() => {
        setTests([]);
        setSelectedTestId('');
        setError('Impossible de charger les tests standards pour le moment.');
      });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_DRAFT_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        name?: string;
        description?: string;
        questions?: unknown;
      };

      if (typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        setCustomName(parsed.name);
      }
      if (typeof parsed.description === 'string') {
        setCustomDescription(parsed.description);
      }

      const normalizedQuestions = normalizeCustomQuestions(parsed.questions);
      if (
        normalizedQuestions.length >= CUSTOM_MIN_QUESTIONS
        && normalizedQuestions.length <= CUSTOM_MAX_QUESTIONS
      ) {
        setCustomQuestions(normalizedQuestions);
      }
    } catch {
      // Ignore invalid local payloads.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        CUSTOM_DRAFT_KEY,
        JSON.stringify({
          name: customName,
          description: customDescription,
          questions: customQuestions,
        }),
      );
    } catch {
      // Ignore localStorage write failures.
    }
  }, [customName, customDescription, customQuestions]);

  useEffect(() => {
    if (!createdSessionCode) return;

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/flashflag/session/${createdSessionCode}`, { cache: 'no-store' });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error?.message || 'Suivi indisponible');
        }

        if (!active) return;

        const data = json.data as {
          status: 'pending' | 'in_progress' | 'completed';
          score: SessionWatchData['score'];
          test?: { name?: string };
          answers?: SessionWatchAnswer[];
        };

        setWatchData({
          status: data.status,
          score: data.score,
          test: data.test?.name ? { name: data.test.name } : undefined,
          answers: Array.isArray(data.answers) ? data.answers : [],
        });
        setWatchError('');

        if (data.status === 'completed' && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        if (!active) return;
        setWatchError(err instanceof Error ? err.message : 'Suivi indisponible');
      }
    };

    fetchSession();
    intervalId = setInterval(fetchSession, 3000);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [createdSessionCode]);

  const canCreate = useMemo(() => {
    const profileValid = createSchema.safeParse({ subjectAge }).success;
    if (!profileValid) return false;

    if (sourceType === 'standard') {
      return selectedTestId.length > 0;
    }

    if (customQuestions.length < CUSTOM_MIN_QUESTIONS || customQuestions.length > CUSTOM_MAX_QUESTIONS) {
      return false;
    }

    const validQuestions = customQuestions.every((question) => {
      if (question.text.trim().length < 3) return false;
      if (!Number.isFinite(question.timeLimitSec) || question.timeLimitSec < 3 || question.timeLimitSec > 30) return false;
      if (question.options.length < 2 || question.options.length > 3) return false;
      return question.options.every((option) => option.text.trim().length > 0);
    });

    return customName.trim().length >= 3 && validQuestions;
  }, [subjectAge, sourceType, selectedTestId, customName, customQuestions]);

  const createSession = async () => {
    if (!canCreate) return;

    setLoading(true);
    setError('');
    setCreatedLink('');
    setCreatedSessionCode('');
    setWatchData(null);
    setWatchError('');

    const payload: Record<string, unknown> = {
      mode,
      sourceType,
      subjectSex,
      subjectAge,
    };

    if (sourceType === 'standard') {
      payload.standardTestId = selectedTestId;
    } else {
      payload.customTest = {
        name: customName,
        description: customDescription || null,
        questions: customQuestions,
      };
    }

    try {
      const response = await fetch('/api/flashflag/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Creation impossible');

      const playUrl: string = json.data.playUrl;
      const code = playUrl.split('/').pop() || '';

      if (mode === 'local') {
        router.push(`/flashflag/session/${code}`);
        return;
      }

      setCreatedLink(playUrl);
      setCreatedSessionCode(code);
    } catch (err) {
      if (mode === 'link') {
        setError(err instanceof Error ? err.message : 'Impossible de generer un lien partageable pour le moment.');
        return;
      }

      if (sourceType !== 'custom') {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        return;
      }

      const inlinePayload = {
        mode,
        sourceType,
        subjectSex,
        subjectAge,
        test: {
          name: customName,
          description: customDescription || null,
          questions: customQuestions,
        },
      };

      const payloadToken = encodePayloadToBase64Url(inlinePayload);
      const localCode = `L${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      router.push(`/flashflag/session/${localCode}#payload=${payloadToken}`);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, patch: Partial<CustomQuestion>) => {
    setCustomQuestions((prev) => prev.map((question, i) => (i === index ? { ...question, ...patch } : question)));
  };

  const updateOption = (qIndex: number, optIndex: number, patch: Partial<{ text: string; score: 0 | 1 | 2 }>) => {
    setCustomQuestions((prev) => prev.map((question, qi) => {
      if (qi !== qIndex) return question;
      return {
        ...question,
        options: question.options.map((option, oi) => (oi === optIndex ? { ...option, ...patch } : option)),
      };
    }));
  };

  const addQuestion = () => {
    setCustomQuestions((prev) => {
      if (prev.length >= CUSTOM_MAX_QUESTIONS) return prev;
      return [...prev, defaultQuestion()];
    });
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions((prev) => {
      if (prev.length <= CUSTOM_MIN_QUESTIONS) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const addOption = (qIndex: number) => {
    setCustomQuestions((prev) => prev.map((question, qi) => {
      if (qi !== qIndex || question.options.length >= 3) return question;
      return {
        ...question,
        options: [...question.options, { text: '', score: 1 }],
      };
    }));
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setCustomQuestions((prev) => prev.map((question, qi) => {
      if (qi !== qIndex || question.options.length <= 2) return question;
      return {
        ...question,
        options: question.options.filter((_, oi) => oi !== optIndex),
      };
    }));
  };

  const resetCustomDraft = () => {
    setCustomName('Test perso rapide');
    setCustomDescription('');
    setCustomQuestions(Array.from({ length: CUSTOM_MIN_QUESTIONS }, () => defaultQuestion()));
  };

  const watchPercent = watchData && watchData.score.max > 0
    ? Math.round((watchData.score.total / watchData.score.max) * 100)
    : 0;

  const watchAnswers = useMemo(() => {
    if (!watchData?.answers?.length) return [];
    return [...watchData.answers].sort((a, b) => a.question_index - b.question_index);
  }, [watchData]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#09090A] text-[#FAFAFA] px-4 py-6 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_14px,rgba(255,255,255,0.5)_14px,rgba(255,255,255,0.5)_15px)] opacity-[0.05]" />
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/14 blur-3xl" />
        <div className="absolute top-20 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-[#F59E0B]/12 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/4 rounded-full bg-[#EF4444]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <Link href="/" className="inline-flex min-h-12 min-w-12 items-center gap-2 rounded-lg px-2 text-sm text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-white active:scale-95">
          <span>←</span>
          <span>Retour accueil</span>
        </Link>

        <header className="rounded-3xl border border-[#2B2B2D] bg-[linear-gradient(125deg,#101012_0%,#161619_58%,#2A1318_100%)] p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FCA5A5]">Flash Flag Sprint</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Match sympa ou mega red flag ?</h1>
              <p className="mt-3 text-sm text-[#E4E4E7] sm:text-base">
                Tu envoies le test, la personne repond vite, et tu vois direct si vos valeurs matchent.
              </p>
            </div>
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green"
              width={220}
              height={48}
              className="h-10 w-auto opacity-90 sm:h-12"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FCD34D]">Exemple reel</p>
            <p className="mt-1 text-sm text-[#E5E7EB]">
              Tu discutes avec quelqu un sur Tinder et vous parlez d un rendez-vous. Tu envoies Flash Flag: en 2 minutes,
              tu sais si c est alignement de valeurs ou gros warning.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-semibold text-[#FCA5A5]">⚡ Rapide</p>
              <p className="mt-1 text-xs text-[#D4D4D8]">Un mini sprint de questions, pas de roman.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-semibold text-[#FCD34D]">⏱ Instinctif</p>
              <p className="mt-1 text-xs text-[#D4D4D8]">Temps court par question pour eviter le baratin.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-semibold text-[#86EFAC]">🔗 Partageable</p>
              <p className="mt-1 text-xs text-[#D4D4D8]">Tu peux envoyer un lien ou le faire direct sur place.</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2B2B2D] bg-[#111113] p-5 shadow-[0_8px_36px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg font-bold">1. Qui est evalue ?</h2>
            <p className="mt-1 text-xs text-[#A3A3A3]">Profil de la personne qui va repondre au test.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-[#D4D4D8]">Sexe</span>
                <select
                  className="w-full rounded-xl border border-white/12 bg-[#17181B] px-3 py-2.5 focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                  value={subjectSex}
                  onChange={(event) => setSubjectSex(event.target.value as SubjectSex)}
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-[#D4D4D8]">Age</span>
                <input
                  type="number"
                  min={16}
                  max={99}
                  className="w-full rounded-xl border border-white/12 bg-[#17181B] px-3 py-2.5 focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                  value={subjectAge}
                  onChange={(event) => setSubjectAge(Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2B2B2D] bg-[#111113] p-5 shadow-[0_8px_36px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg font-bold">2. Quel type de test envoyer ?</h2>
            <p className="mt-1 text-xs text-[#A3A3A3]">Selectionne d abord le format du questionnaire.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                className={`rounded-2xl border p-3 text-left transition ${sourceType === 'standard' ? 'border-[#EF4444] bg-[#2A1519] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.25)]' : 'border-white/12 bg-[#17181B] text-[#D4D4D8] hover:border-white/25 hover:text-white'}`}
                onClick={() => setSourceType('standard')}
              >
                <p className="text-sm font-bold">⚙ Test standard</p>
                <p className="mt-1 text-xs text-current/80">Liste prete, creee dans l admin.</p>
              </button>

              <button
                className={`rounded-2xl border p-3 text-left transition ${sourceType === 'custom' ? 'border-[#EF4444] bg-[#2A1519] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.25)]' : 'border-white/12 bg-[#17181B] text-[#D4D4D8] hover:border-white/25 hover:text-white'}`}
                onClick={() => setSourceType('custom')}
              >
                <p className="text-sm font-bold">🧩 Test perso</p>
                <p className="mt-1 text-xs text-current/80">De {CUSTOM_MIN_QUESTIONS} a {CUSTOM_MAX_QUESTIONS} questions.</p>
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2B2B2D] bg-[#111113] p-5 shadow-[0_8px_36px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-bold">3. Regler le contenu du test</h2>

          {sourceType === 'standard' ? (
            <div className="mt-4 space-y-3">
              {tests.length === 0 ? (
                <p className="text-sm text-[#FCA5A5]">Aucun test standard actif n est disponible pour le moment.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {tests.map((test) => {
                    const selected = selectedTestId === test.id;
                    const durationLabel = formatDurationFromSeconds(test.questionCount * 7);

                    return (
                      <button
                        key={test.id}
                        onClick={() => setSelectedTestId(test.id)}
                        className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-[#EF4444] bg-[#1F1315] shadow-[0_0_0_1px_rgba(239,68,68,0.25)]' : 'border-white/10 bg-[#17181B] hover:border-white/25'}`}
                      >
                        <p className="text-sm font-bold text-white">{test.name}</p>
                        <p className="mt-1 text-xs text-[#A3A3A3]">{test.description || 'Sans description'}</p>
                        <p className="mt-3 text-xs text-[#D4D4D8]">{test.questionCount} questions • {durationLabel}</p>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedStandardTest && (
                <p className="text-xs text-[#A3A3A3]">
                  Selection actuelle: <span className="font-semibold text-[#F5F5F5]">{selectedStandardTest.name}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-[#D4D4D8]">Nom du test perso</span>
                  <input
                    className="w-full rounded-xl border border-white/12 bg-[#17181B] px-3 py-2.5 focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                    placeholder="Ex: Valeurs et respect"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-[#D4D4D8]">Description (optionnelle)</span>
                  <input
                    className="w-full rounded-xl border border-white/12 bg-[#17181B] px-3 py-2.5 focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                    placeholder="Ex: questions claires et directes"
                    value={customDescription}
                    onChange={(event) => setCustomDescription(event.target.value)}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-[#2F2F2F] bg-[#141416] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#E4E4E7]">
                    {customQuestions.length} question(s) • {customEstimatedDuration}
                  </p>
                  <button
                    className="rounded-lg border border-[#7F1D1D] px-2.5 py-1.5 text-xs text-[#FCA5A5] hover:bg-[#2A1519]"
                    onClick={resetCustomDraft}
                  >
                    Reinitialiser
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#A3A3A3]">
                  Tu peux adapter librement entre {CUSTOM_MIN_QUESTIONS} et {CUSTOM_MAX_QUESTIONS} questions.
                </p>
              </div>

              <div className="space-y-3">
                {customQuestions.map((question, qIndex) => (
                  <div key={qIndex} className="rounded-2xl border border-white/10 bg-[#17181B] p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[#A3A3A3]">Question {qIndex + 1}</p>
                      <button
                        className="rounded border border-white/20 px-2 py-1 text-xs text-[#D4D4D8] disabled:opacity-40"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={customQuestions.length <= CUSTOM_MIN_QUESTIONS}
                      >
                        Supprimer
                      </button>
                    </div>

                    <input
                      className="w-full rounded-lg border border-white/12 bg-[#131416] px-2.5 py-2 text-sm focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                      placeholder="Texte de la question"
                      value={question.text}
                      onChange={(event) => updateQuestion(qIndex, { text: event.target.value })}
                    />

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#D4D4D8]">Temps (sec)</label>
                      <input
                        type="number"
                        min={3}
                        max={30}
                        className="w-24 rounded-lg border border-white/12 bg-[#131416] px-2 py-1.5 text-sm focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                        value={question.timeLimitSec}
                        onChange={(event) => updateQuestion(qIndex, { timeLimitSec: Number(event.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="grid grid-cols-[1fr_auto_auto] gap-2">
                          <input
                            className="rounded-lg border border-white/12 bg-[#131416] px-2 py-1.5 text-sm focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                            placeholder={`Option ${optIndex + 1}`}
                            value={option.text}
                            onChange={(event) => updateOption(qIndex, optIndex, { text: event.target.value })}
                          />
                          <select
                            className="rounded-lg border border-white/12 bg-[#131416] px-2 py-1.5 text-sm focus:border-[#EF4444]/70 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20"
                            value={option.score}
                            onChange={(event) => updateOption(qIndex, optIndex, { score: Number(event.target.value) as 0 | 1 | 2 })}
                          >
                            <option value={0}>Score 0</option>
                            <option value={1}>Score 1</option>
                            <option value={2}>Score 2</option>
                          </select>
                          <button
                            className="rounded border border-white/20 px-2 py-1 text-xs text-[#D4D4D8] disabled:opacity-40"
                            onClick={() => removeOption(qIndex, optIndex)}
                            disabled={question.options.length <= 2}
                          >
                            -
                          </button>
                        </div>
                      ))}

                      {question.options.length < 3 && (
                        <button
                          className="rounded border border-dashed border-white/30 px-2 py-1 text-xs text-[#D4D4D8] hover:border-white/45"
                          onClick={() => addOption(qIndex)}
                        >
                          Ajouter une 3e option
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-white/20 bg-[#111216] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-[#A3A3A3]">Besoin d une question en plus ? Ajoute-la directement en bas.</p>
                  <button
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-[#E4E4E7] hover:border-white/35 disabled:opacity-40"
                    onClick={addQuestion}
                    disabled={customQuestions.length >= CUSTOM_MAX_QUESTIONS}
                  >
                    + Ajouter une question en bas
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#2B2B2D] bg-[#111113] p-5 space-y-4 shadow-[0_8px_36px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-bold">4. Choisir l envoi puis lancer</h2>
          <p className="text-xs text-[#A3A3A3]">Derniere etape: choisis le mode d envoi juste avant de generer la session.</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={`rounded-2xl border p-4 text-left transition ${mode === 'local' ? 'border-[#EF4444] bg-[#2A1519] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.25)]' : 'border-white/12 bg-[#17181B] text-[#D4D4D8] hover:border-white/25 hover:text-white'}`}
              onClick={() => setMode('local')}
            >
              <p className="text-sm font-bold">📱 Jouer en local</p>
              <p className="mt-1 text-xs text-current/80">Tu gardes le telephone et la personne repond tout de suite.</p>
            </button>

            <button
              className={`rounded-2xl border p-4 text-left transition ${mode === 'link' ? 'border-[#EF4444] bg-[#2A1519] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.25)]' : 'border-white/12 bg-[#17181B] text-[#D4D4D8] hover:border-white/25 hover:text-white'}`}
              onClick={() => setMode('link')}
            >
              <p className="text-sm font-bold">🔗 Envoyer un lien</p>
              <p className="mt-1 text-xs text-current/80">Tu partages l URL, la personne repond depuis son appareil.</p>
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#15161A] p-3 text-xs text-[#D4D4D8]">
            En local: usage immediat sur cet ecran. En lien: ideal pour un envoi en message avant un rendez-vous.
          </div>

          <button
            disabled={!canCreate || loading}
            onClick={createSession}
            className="w-full rounded-xl bg-[#EF4444] px-4 py-3 font-bold transition-colors hover:bg-[#F87171] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Generation en cours...' : mode === 'link' ? 'Generer le lien a partager' : 'Demarrer sur cet appareil'}
          </button>

          {createdLink && (
            <div className="rounded-xl border border-[#7F1D1D] bg-[#1A1212] p-3 space-y-2">
              <p className="text-sm text-[#FECACA]">Lien pret a envoyer</p>
              <p className="text-xs break-all text-[#F5F5F5]">{createdLink}</p>
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-[#991B1B] px-3 py-2 text-sm transition-colors hover:bg-[#B91C1C]"
                  onClick={() => navigator.clipboard.writeText(createdLink)}
                >
                  Copier
                </button>
                <button
                  className="rounded-lg bg-[#27272A] px-3 py-2 text-sm transition-colors hover:bg-[#3F3F46]"
                  onClick={() => window.open(createdLink, '_blank')}
                >
                  Ouvrir
                </button>
              </div>
            </div>
          )}

          {createdSessionCode && (
            <div className="rounded-xl border border-[#1E1E1E] bg-[#121214] p-3 space-y-2">
              <p className="text-sm font-semibold text-[#E4E4E7]">Suivi de cette invitation</p>
              <p className="text-xs text-[#A3A3A3]">Code session: {createdSessionCode}</p>

              {watchData && watchData.status === 'pending' && (
                <p className="text-xs text-[#D4D4D8]">Le test n a pas encore ete lance par le destinataire.</p>
              )}

              {watchData && watchData.status === 'in_progress' && (
                <p className="text-xs text-[#FCA5A5]">Le destinataire est en train de repondre au test.</p>
              )}

              {watchData && watchData.status === 'completed' && (
                <div className="rounded-lg border border-[#7F1D1D] bg-[#1A1212] p-3 space-y-2">
                  <p className="text-sm text-[#FECACA]">Resultat recu</p>
                  <p className="text-xs text-[#E4E4E7]">Score: {watchData.score.total}/{watchData.score.max} ({watchPercent}%)</p>
                  <p className="text-xs text-[#E4E4E7]">Niveau: {getRiskLabelFromPercent(watchPercent)}</p>
                  <p className="text-xs text-[#D4D4D8]">Reponses: {watchData.score.answered} | Timeout: {watchData.score.timedOut}</p>

                  {watchData.test?.name && (
                    <p className="text-xs text-[#D4D4D8]">Test: {watchData.test.name}</p>
                  )}

                  {watchAnswers.length > 0 && (
                    <div className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
                      {watchAnswers.map((answer, idx) => (
                        <div key={`${answer.question_index}-${idx}`} className="rounded-lg border border-white/10 bg-[#111316] p-2.5">
                          <p className="text-[11px] text-[#A3A3A3]">Question {answer.question_index + 1}</p>
                          <p className="mt-0.5 text-xs text-[#F5F5F5]">{answer.question_text}</p>
                          <p className={`mt-1 text-xs ${answer.timed_out ? 'text-[#FCA5A5]' : 'text-[#D4D4D8]'}`}>
                            {answer.timed_out
                              ? 'Temps ecoule (0 point)'
                              : `Reponse: ${answer.selected_option || 'Sans selection'} (${answer.selected_score} point${answer.selected_score > 1 ? 's' : ''})`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1">
                    <Link
                      href={`/flashflag/session/${createdSessionCode}`}
                      className="inline-flex items-center gap-1 text-xs text-[#FCA5A5] transition-colors hover:text-[#FECACA]"
                    >
                      Voir la session complete →
                    </Link>
                  </div>
                </div>
              )}

              {!watchData && !watchError && (
                <p className="text-xs text-[#D4D4D8]">Initialisation du suivi en cours...</p>
              )}

              {watchError && <p className="text-xs text-[#FCA5A5]">Suivi: {watchError}</p>}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-sm text-[#FECACA]">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
