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

interface LocalStandardTest {
  id: string;
  name: string;
  description: string | null;
  questions: CustomQuestion[];
  is_active?: boolean;
  updated_at?: string;
}

interface SessionWatchData {
  status: 'pending' | 'in_progress' | 'completed';
  score: {
    total: number;
    max: number;
    answered: number;
    timedOut: number;
  };
}

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

const CUSTOM_DRAFT_KEY = 'flashflag_custom_draft_v1';
const LOCAL_STANDARD_TESTS_KEY = 'flashflag_local_standard_tests_v1';

const FALLBACK_STANDARD_TEST: LocalStandardTest = {
  id: 'fallback-standard-radar',
  name: 'Radar Date Express',
  description: '15 questions rapides pour reperer les signaux rouges.',
  questions: [
    { text: 'Es-tu feministe ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'C est complique', score: 1 }, { text: 'Non', score: 2 }] },
    { text: 'Es-tu deja alle voir un psy ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'Non', score: 1 }, { text: 'J en ai pas besoin', score: 2 }] },
    { text: 'Ton meilleur pote trompe sa copine ?', timeLimitSec: 7, options: [{ text: 'Je le recadre', score: 0 }, { text: 'Je la previens', score: 1 }, { text: 'Je le couvre', score: 2 }] },
    { text: 'As-tu deja pleure devant un film ?', timeLimitSec: 7, options: [{ text: 'Oui', score: 0 }, { text: 'Rarement', score: 1 }, { text: 'Non jamais', score: 2 }] },
    { text: 'Les compliments dans la rue ?', timeLimitSec: 7, options: [{ text: 'C est lourd', score: 0 }, { text: 'C est normal', score: 1 }, { text: 'C est flatteur', score: 2 }] },
    { text: 'Elle dit pas ce soir ?', timeLimitSec: 7, options: [{ text: 'Ok pas de souci', score: 0 }, { text: 'Mais pourquoi ?', score: 1 }, { text: 'J insiste un peu', score: 2 }] },
    { text: 'Elle sort sans toi ?', timeLimitSec: 7, options: [{ text: 'Amuse-toi bien', score: 0 }, { text: 'Fais attention', score: 1 }, { text: 'Tu rentres quand ?', score: 2 }] },
    { text: 'Apres une grosse dispute ?', timeLimitSec: 7, options: [{ text: 'On en discute', score: 0 }, { text: 'Je fais le mort', score: 1 }, { text: 'J attends ses excuses', score: 2 }] },
    { text: 'Ton ex en un mot ?', timeLimitSec: 7, options: [{ text: 'Une histoire passee', score: 0 }, { text: 'C etait une folle', score: 1 }, { text: 'Une manipulatrice', score: 2 }] },
    { text: 'Ton bord politique ?', timeLimitSec: 7, options: [{ text: 'La gauche', score: 0 }, { text: 'Apolitique centre', score: 1 }, { text: 'La droite', score: 2 }] },
    { text: 'Face a Men are trash ?', timeLimitSec: 7, options: [{ text: 'Je comprends l idee', score: 0 }, { text: 'Not all men', score: 1 }, { text: 'C est misandre', score: 2 }] },
    { text: 'Le privilege masculin ?', timeLimitSec: 7, options: [{ text: 'J en suis conscient', score: 0 }, { text: 'J ai galere aussi', score: 1 }, { text: 'Ca n existe pas', score: 2 }] },
    { text: 'Sur la question du genre ?', timeLimitSec: 7, options: [{ text: 'C est un spectre', score: 0 }, { text: 'C est une mode internet', score: 1 }, { text: 'Il n y a que deux genres', score: 2 }] },
    { text: 'La masculinite toxique ?', timeLimitSec: 7, options: [{ text: 'Un probleme systemique', score: 0 }, { text: 'Terme exagere', score: 1 }, { text: 'Une invention', score: 2 }] },
    { text: 'Les milliardaires ?', timeLimitSec: 7, options: [{ text: 'Il faut taxer massivement', score: 0 }, { text: 'Ils ont travaille dur', score: 1 }, { text: 'Ce sont des genies', score: 2 }] },
  ],
};

const DEFAULT_FALLBACK_STANDARD_TESTS: LocalStandardTest[] = [FALLBACK_STANDARD_TEST];

function toStandardMetadata(list: LocalStandardTest[]): StandardTest[] {
  return list
    .filter((item) => item.is_active !== false)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      questionCount: item.questions.length,
    }));
}

function loadLocalStandardTests(): LocalStandardTest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STANDARD_TESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalStandardTest[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.name && Array.isArray(item.questions));
  } catch {
    return [];
  }
}

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

export default function FlashFlagPage() {
  const router = useRouter();

  const [subjectSex, setSubjectSex] = useState<SubjectSex>('homme');
  const [subjectAge, setSubjectAge] = useState<number>(25);
  const [sourceType, setSourceType] = useState<SourceType>('standard');
  const [mode, setMode] = useState<Mode>('local');
  const [tests, setTests] = useState<StandardTest[]>([]);
  const [localStandardTests, setLocalStandardTests] = useState<LocalStandardTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [customName, setCustomName] = useState('Test perso express');
  const [customDescription, setCustomDescription] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(Array.from({ length: 10 }, () => defaultQuestion()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState('');
  const [createdSessionCode, setCreatedSessionCode] = useState('');
  const [watchData, setWatchData] = useState<SessionWatchData | null>(null);
  const [watchError, setWatchError] = useState('');

  useEffect(() => {
    const localTests = loadLocalStandardTests();
    if (localTests.length > 0) {
      const localMetadata = toStandardMetadata(localTests);
      setLocalStandardTests(localTests);
      setTests(localMetadata);
      if (localMetadata.length > 0) setSelectedTestId(localMetadata[0].id);
      return;
    }

    fetch('/api/flashflag/tests')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.data?.tests || []) as StandardTest[];
        if (list.length > 0) {
          setTests(list);
          setSelectedTestId(list[0].id);
          return;
        }

        setLocalStandardTests(DEFAULT_FALLBACK_STANDARD_TESTS);
        setTests(toStandardMetadata(DEFAULT_FALLBACK_STANDARD_TESTS));
        setSelectedTestId(DEFAULT_FALLBACK_STANDARD_TESTS[0].id);
      })
      .catch(() => {
        setLocalStandardTests(DEFAULT_FALLBACK_STANDARD_TESTS);
        setTests(toStandardMetadata(DEFAULT_FALLBACK_STANDARD_TESTS));
        setSelectedTestId(DEFAULT_FALLBACK_STANDARD_TESTS[0].id);
        setError('Mode fallback actif: test standard embarque charge.');
      });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        name?: string;
        description?: string;
        questions?: CustomQuestion[];
      };
      if (parsed.name) setCustomName(parsed.name);
      if (parsed.description) setCustomDescription(parsed.description);
      if (parsed.questions && parsed.questions.length === 10) setCustomQuestions(parsed.questions);
    } catch {
      // Ignore invalid local draft payloads
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_DRAFT_KEY, JSON.stringify({
        name: customName,
        description: customDescription,
        questions: customQuestions,
      }));
    } catch {
      // Ignore localStorage write failures
    }
  }, [customName, customDescription, customQuestions]);

  useEffect(() => {
    if (!createdSessionCode) return;

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/flashflag/session/${createdSessionCode}`, {
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || 'Suivi indisponible');
        }

        if (!active) return;
        const data = json.data as SessionWatchData;
        setWatchData({
          status: data.status,
          score: data.score,
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
    const parsed = createSchema.safeParse({ subjectAge });
    if (!parsed.success) return false;
    if (sourceType === 'standard') return selectedTestId.length > 0;

    const validQuestions = customQuestions.every((q) =>
      q.text.trim().length >= 3 &&
      q.options.length >= 2 &&
      q.options.length <= 3 &&
      q.options.every((opt) => opt.text.trim().length > 0),
    );

    return customName.trim().length >= 3 && customQuestions.length === 10 && validQuestions;
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
      const res = await fetch('/api/flashflag/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Creation impossible');

      const playUrl: string = json.data.playUrl;
      const code = playUrl.split('/').pop() || '';

      if (mode === 'local') {
        router.push(`/flashflag/session/${code}`);
        return;
      }

      setCreatedLink(playUrl);
      setCreatedSessionCode(code);
    } catch (e) {
      if (mode === 'link') {
        setError(e instanceof Error ? e.message : 'Impossible de generer un lien partageable pour le moment.');
        return;
      }

      const selectedLocal = localStandardTests.find((test) => test.id === selectedTestId)
        || DEFAULT_FALLBACK_STANDARD_TESTS.find((test) => test.id === selectedTestId)
        || null;

      const fallbackTest = sourceType === 'custom'
        ? {
          name: customName,
          description: customDescription || null,
          questions: customQuestions,
        }
        : selectedLocal;

      if (!fallbackTest) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
        return;
      }

      const inlinePayload = {
        mode,
        sourceType,
        subjectSex,
        subjectAge,
        test: fallbackTest,
      };

      const payloadToken = encodePayloadToBase64Url(inlinePayload);
      const localCode = `L${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      if (mode === 'local') {
        router.push(`/flashflag/session/${localCode}#payload=${payloadToken}`);
        return;
      }

      setError('Mode local fallback actif: impossible d utiliser la base de donnees.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, patch: Partial<CustomQuestion>) => {
    setCustomQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    setCustomQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      return {
        ...q,
        options: q.options.map((opt, oi) => (oi === optIndex ? { ...opt, text } : opt)),
      };
    }));
  };

  const addOption = (qIndex: number) => {
    setCustomQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex || q.options.length >= 3) return q;
      return {
        ...q,
        options: [...q.options, { text: '', score: 1 }],
      };
    }));
  };

  const watchPercent = watchData && watchData.score.max > 0
    ? Math.round((watchData.score.total / watchData.score.max) * 100)
    : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070708] text-[#F5F5F5] px-4 py-6 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DC2626]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-[#EF4444]/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <Link href="/" className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
          <span>←</span>
          <span>Retour accueil</span>
        </Link>

        <header className="rounded-3xl border border-[#3B1B1B] bg-[linear-gradient(120deg,#171212,#1F1114_55%,#271216)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] text-[#FCA5A5] uppercase">Red or Green • Mode Sprint</p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">Flash Flag</h1>
              <p className="text-sm text-[#D4D4D8] mt-2 max-w-2xl">Questionnaire chronometre, sans retour arriere, pour capturer les reponses a chaud.</p>
            </div>
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green"
              width={220}
              height={48}
              className="h-10 w-auto opacity-90 sm:h-12"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[#7F1D1D] bg-[#2A1519] px-3 py-1 text-[#FECACA]">⚡ Questions rapides</span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[#E4E4E7]">🚩 Score red flag instantane</span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[#E4E4E7]">🔗 Mode local ou lien partageable</span>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#111214]/90 p-5 space-y-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <h2 className="font-bold text-lg">1. Profil de la personne testee</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-sm text-[#D4D4D8]">Sexe</span>
              <select className="w-full rounded-xl bg-[#17181B] border border-white/12 px-3 py-2.5 focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" value={subjectSex} onChange={(e) => setSubjectSex(e.target.value as SubjectSex)}>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[#D4D4D8]">Age</span>
              <input type="number" min={16} max={99} className="w-full rounded-xl bg-[#17181B] border border-white/12 px-3 py-2.5 focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" value={subjectAge} onChange={(e) => setSubjectAge(Number(e.target.value))} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#111214]/90 p-5 space-y-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <h2 className="font-bold text-lg">2. Choix du test</h2>
          <div className="flex gap-2">
            <button className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${sourceType === 'standard' ? 'bg-[#2A1519] border-[#EF4444] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : 'bg-transparent border-white/15 text-[#C9CBD1] hover:border-white/25 hover:text-white'}`} onClick={() => setSourceType('standard')}>Standard</button>
            <button className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${sourceType === 'custom' ? 'bg-[#2A1519] border-[#EF4444] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : 'bg-transparent border-white/15 text-[#C9CBD1] hover:border-white/25 hover:text-white'}`} onClick={() => setSourceType('custom')}>Perso (10 questions)</button>
          </div>

          {sourceType === 'standard' ? (
            <div className="space-y-2">
              <label className="text-sm text-[#D4D4D8]">Pack standard</label>
              <select className="w-full rounded-xl bg-[#17181B] border border-white/12 px-3 py-2.5 focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)}>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>{test.name} ({test.questionCount} questions)</option>
                ))}
              </select>
              {tests.length === 0 && <p className="text-xs text-[#FCA5A5]">Aucun test standard actif trouve.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <input className="w-full rounded-xl bg-[#17181B] border border-white/12 px-3 py-2.5 focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" placeholder="Nom du test" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <input className="w-full rounded-xl bg-[#17181B] border border-white/12 px-3 py-2.5 focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" placeholder="Description" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} />

              <div className="flex flex-wrap gap-2">
                <button
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/20 text-[#E4E4E7] hover:border-white/35 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      name: customName,
                      description: customDescription,
                      questions: customQuestions,
                    }));
                  }}
                >
                  Copier le brouillon JSON
                </button>
                <button
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#7F1D1D] text-[#FECACA] hover:bg-[#2A1519] transition-colors"
                  onClick={() => {
                    setCustomName('');
                    setCustomDescription('');
                    setCustomQuestions(Array.from({ length: 10 }, () => defaultQuestion()));
                  }}
                >
                  Reinitialiser le test perso
                </button>
                <button
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-white/20 text-[#D4D4D8] hover:border-white/35 transition-colors"
                  onClick={() => {
                    const raw = window.prompt('Collez ici le JSON du brouillon Flash Flag');
                    if (!raw) return;
                    try {
                      const parsed = JSON.parse(raw) as {
                        name?: string;
                        description?: string;
                        questions?: CustomQuestion[];
                      };
                      if (parsed.name) setCustomName(parsed.name);
                      setCustomDescription(parsed.description || '');
                      if (parsed.questions && parsed.questions.length === 10) {
                        setCustomQuestions(parsed.questions);
                      }
                      setError('');
                    } catch {
                      setError('JSON invalide pour le brouillon importe');
                    }
                  }}
                >
                  Importer un brouillon JSON
                </button>
              </div>

              <div className="space-y-3">
                {customQuestions.map((question, qIndex) => (
                  <div key={qIndex} className="rounded-xl border border-white/10 bg-[#17181B] p-3 space-y-2">
                    <p className="text-xs text-[#A3A3A3]">Question {qIndex + 1}</p>
                    <input className="w-full rounded-lg bg-[#131416] border border-white/12 px-2 py-1.5 text-sm focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" placeholder="Texte de la question" value={question.text} onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#D4D4D8]">Temps (sec)</label>
                      <input type="number" min={3} max={30} className="w-20 rounded-lg bg-[#131416] border border-white/12 px-2 py-1.5 text-sm focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" value={question.timeLimitSec} onChange={(e) => updateQuestion(qIndex, { timeLimitSec: Number(e.target.value) })} />
                    </div>

                    <div className="space-y-2">
                      {question.options.map((opt, optIndex) => (
                        <div key={optIndex} className="grid grid-cols-[1fr_auto] gap-2">
                          <input className="rounded-lg bg-[#131416] border border-white/12 px-2 py-1.5 text-sm focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" placeholder={`Option ${optIndex + 1}`} value={opt.text} onChange={(e) => updateOption(qIndex, optIndex, e.target.value)} />
                          <select className="rounded-lg bg-[#131416] border border-white/12 px-2 py-1.5 text-sm focus:outline-none focus:border-[#EF4444]/70 focus:ring-2 focus:ring-[#EF4444]/20 transition" value={opt.score} onChange={(e) => {
                            const score = Number(e.target.value) as 0 | 1 | 2;
                            setCustomQuestions((prev) => prev.map((q, qi) => qi !== qIndex ? q : {
                              ...q,
                              options: q.options.map((item, oi) => oi !== optIndex ? item : { ...item, score }),
                            }));
                          }}>
                            <option value={0}>Score 0</option>
                            <option value={1}>Score 1</option>
                            <option value={2}>Score 2</option>
                          </select>
                        </div>
                      ))}
                      {question.options.length < 3 && (
                        <button className="text-xs px-2 py-1 rounded-lg border border-dashed border-white/30 text-[#D4D4D8] hover:border-white/45 transition-colors" onClick={() => addOption(qIndex)}>
                          Ajouter 3e option
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#111214]/90 p-5 space-y-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm">
          <h2 className="font-bold text-lg">3. Lancement</h2>
          <div className="flex gap-2">
            <button className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'local' ? 'bg-[#2A1519] border-[#EF4444] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : 'bg-transparent border-white/15 text-[#C9CBD1] hover:border-white/25 hover:text-white'}`} onClick={() => setMode('local')}>Joueur local</button>
            <button className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'link' ? 'bg-[#2A1519] border-[#EF4444] text-white shadow-[0_0_0_1px_rgba(239,68,68,0.2)]' : 'bg-transparent border-white/15 text-[#C9CBD1] hover:border-white/25 hover:text-white'}`} onClick={() => setMode('link')}>Envoyer un lien</button>
          </div>
          <p className="text-xs text-[#A3A3A3]">Le mode lien permet a la personne cible de lancer le test elle-meme depuis son appareil.</p>

          <button disabled={!canCreate || loading} onClick={createSession} className="w-full rounded-xl bg-[#EF4444] hover:bg-[#F87171] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 font-bold transition-colors">
            {loading ? 'Generation...' : 'Generer le test'}
          </button>

          {createdLink && (
            <div className="rounded-xl border border-[#7F1D1D] bg-[#1A1212] p-3 space-y-2">
              <p className="text-sm text-[#FECACA]">Lien pret:</p>
              <p className="text-xs break-all text-[#F5F5F5]">{createdLink}</p>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg bg-[#991B1B] hover:bg-[#B91C1C] text-sm transition-colors" onClick={() => navigator.clipboard.writeText(createdLink)}>Copier</button>
                <button className="px-3 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-sm transition-colors" onClick={() => window.open(createdLink, '_blank')}>Ouvrir</button>
              </div>
            </div>
          )}

          {createdSessionCode && (
            <div className="rounded-xl border border-white/10 bg-[#151619] p-3 space-y-2">
              <p className="text-sm font-semibold text-[#E4E4E7]">Suivi de cette invitation</p>
              <p className="text-xs text-[#A3A3A3]">Code session: {createdSessionCode}</p>

              {watchData && watchData.status === 'pending' && (
                <p className="text-xs text-[#D4D4D8]">Le test n a pas encore ete lance par le destinataire.</p>
              )}

              {watchData && watchData.status === 'in_progress' && (
                <p className="text-xs text-[#FCA5A5]">Le destinataire est en train de repondre au test.</p>
              )}

              {watchData && watchData.status === 'completed' && (
                <div className="rounded-lg border border-[#7F1D1D] bg-[#1A1212] p-3 space-y-1">
                  <p className="text-sm text-[#FECACA]">Resultat recu</p>
                  <p className="text-xs text-[#E4E4E7]">
                    Score: {watchData.score.total}/{watchData.score.max} ({watchPercent}%)
                  </p>
                  <p className="text-xs text-[#E4E4E7]">Niveau: {getRiskLabelFromPercent(watchPercent)}</p>
                  <p className="text-xs text-[#D4D4D8]">
                    Reponses: {watchData.score.answered} | Timeout: {watchData.score.timedOut}
                  </p>
                </div>
              )}

              {!watchData && !watchError && (
                <p className="text-xs text-[#D4D4D8]">Initialisation du suivi en cours...</p>
              )}

              {watchError && <p className="text-xs text-[#FCA5A5]">Suivi: {watchError}</p>}
            </div>
          )}

          {error && <p className="text-sm text-[#FF8C8C]">{error}</p>}
        </section>
      </div>
    </main>
  );
}
