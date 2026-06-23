'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function FlashFlagPage() {
  const router = useRouter();

  const [subjectSex, setSubjectSex] = useState<SubjectSex>('homme');
  const [subjectAge, setSubjectAge] = useState<number>(25);
  const [sourceType, setSourceType] = useState<SourceType>('standard');
  const [mode, setMode] = useState<Mode>('local');
  const [tests, setTests] = useState<StandardTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [customName, setCustomName] = useState('Test perso express');
  const [customDescription, setCustomDescription] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(Array.from({ length: 10 }, () => defaultQuestion()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLink, setCreatedLink] = useState('');

  useEffect(() => {
    fetch('/api/flashflag/tests')
      .then((r) => r.json())
      .then((d) => {
        const list = (d.data?.tests || []) as StandardTest[];
        setTests(list);
        if (list.length > 0) setSelectedTestId(list[0].id);
      })
      .catch(() => setError('Impossible de charger les tests standards'));
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
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

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
          <span>←</span>
          <span>Retour accueil</span>
        </a>

        <header className="rounded-2xl border border-[#3B1B1B] bg-gradient-to-r from-[#151010] via-[#221212] to-[#1A1212] p-5">
          <p className="text-xs tracking-[0.22em] text-[#FCA5A5] uppercase">Nouveau jeu</p>
          <h1 className="text-2xl sm:text-3xl font-black">Flash Flag Sprint</h1>
          <p className="text-sm text-[#D4D4D8] mt-2">Questionnaire chronometre, sans retour arriere, pour des reponses instinctives.</p>
        </header>

        <section className="rounded-2xl border border-[#2E2E2E] bg-[#141414] p-5 space-y-4">
          <h2 className="font-bold text-lg">1. Profil de la personne testee</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-sm text-[#D4D4D8]">Sexe</span>
              <select className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2" value={subjectSex} onChange={(e) => setSubjectSex(e.target.value as SubjectSex)}>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[#D4D4D8]">Age</span>
              <input type="number" min={16} max={99} className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2" value={subjectAge} onChange={(e) => setSubjectAge(Number(e.target.value))} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2E2E2E] bg-[#141414] p-5 space-y-4">
          <h2 className="font-bold text-lg">2. Choix du test</h2>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-lg border ${sourceType === 'standard' ? 'bg-[#2A1313] border-[#DC2626]' : 'bg-transparent border-[#3A3A3A]'}`} onClick={() => setSourceType('standard')}>Standard</button>
            <button className={`px-4 py-2 rounded-lg border ${sourceType === 'custom' ? 'bg-[#2A1313] border-[#DC2626]' : 'bg-transparent border-[#3A3A3A]'}`} onClick={() => setSourceType('custom')}>Perso (10 questions)</button>
          </div>

          {sourceType === 'standard' ? (
            <div className="space-y-2">
              <label className="text-sm text-[#D4D4D8]">Pack standard</label>
              <select className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2" value={selectedTestId} onChange={(e) => setSelectedTestId(e.target.value)}>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>{test.name} ({test.questionCount} questions)</option>
                ))}
              </select>
              {tests.length === 0 && <p className="text-xs text-[#FCA5A5]">Aucun test standard actif trouve.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <input className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2" placeholder="Nom du test" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <input className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2" placeholder="Description" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} />

              <div className="flex flex-wrap gap-2">
                <button
                  className="text-xs px-2.5 py-1.5 rounded border border-[#555] text-[#E4E4E7]"
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
                  className="text-xs px-2.5 py-1.5 rounded border border-[#7F1D1D] text-[#FECACA]"
                  onClick={() => {
                    setCustomName('');
                    setCustomDescription('');
                    setCustomQuestions(Array.from({ length: 10 }, () => defaultQuestion()));
                  }}
                >
                  Reinitialiser le test perso
                </button>
                <button
                  className="text-xs px-2.5 py-1.5 rounded border border-[#444] text-[#D4D4D8]"
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
                  <div key={qIndex} className="rounded-xl border border-[#303030] bg-[#191919] p-3 space-y-2">
                    <p className="text-xs text-[#A3A3A3]">Question {qIndex + 1}</p>
                    <input className="w-full bg-[#1F1F1F] border border-[#3A3A3A] rounded-lg px-2 py-1.5 text-sm" placeholder="Texte de la question" value={question.text} onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[#D4D4D8]">Temps (sec)</label>
                      <input type="number" min={3} max={30} className="w-20 bg-[#1F1F1F] border border-[#3A3A3A] rounded-lg px-2 py-1.5 text-sm" value={question.timeLimitSec} onChange={(e) => updateQuestion(qIndex, { timeLimitSec: Number(e.target.value) })} />
                    </div>

                    <div className="space-y-2">
                      {question.options.map((opt, optIndex) => (
                        <div key={optIndex} className="grid grid-cols-[1fr_auto] gap-2">
                          <input className="bg-[#1F1F1F] border border-[#3A3A3A] rounded-lg px-2 py-1.5 text-sm" placeholder={`Option ${optIndex + 1}`} value={opt.text} onChange={(e) => updateOption(qIndex, optIndex, e.target.value)} />
                          <select className="bg-[#1F1F1F] border border-[#3A3A3A] rounded-lg px-2 py-1.5 text-sm" value={opt.score} onChange={(e) => {
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
                        <button className="text-xs px-2 py-1 rounded border border-dashed border-[#666] text-[#D4D4D8]" onClick={() => addOption(qIndex)}>
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

        <section className="rounded-2xl border border-[#2E2E2E] bg-[#141414] p-5 space-y-4">
          <h2 className="font-bold text-lg">3. Lancement</h2>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-lg border ${mode === 'local' ? 'bg-[#2A1313] border-[#DC2626]' : 'bg-transparent border-[#3A3A3A]'}`} onClick={() => setMode('local')}>Joueur local</button>
            <button className={`px-4 py-2 rounded-lg border ${mode === 'link' ? 'bg-[#2A1313] border-[#DC2626]' : 'bg-transparent border-[#3A3A3A]'}`} onClick={() => setMode('link')}>Envoyer un lien</button>
          </div>
          <p className="text-xs text-[#A3A3A3]">Le mode lien permet a la personne cible de lancer le test elle-meme depuis son appareil.</p>

          <button disabled={!canCreate || loading} onClick={createSession} className="w-full rounded-xl bg-[#E1492F] hover:bg-[#F15F47] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 font-bold">
            {loading ? 'Generation...' : 'Generer le test'}
          </button>

          {createdLink && (
            <div className="rounded-lg border border-[#7F1D1D] bg-[#1A1212] p-3 space-y-2">
              <p className="text-sm text-[#FECACA]">Lien pret:</p>
              <p className="text-xs break-all text-[#F5F5F5]">{createdLink}</p>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded bg-[#991B1B] hover:bg-[#B91C1C] text-sm" onClick={() => navigator.clipboard.writeText(createdLink)}>Copier</button>
                <button className="px-3 py-2 rounded bg-[#27272A] hover:bg-[#3F3F46] text-sm" onClick={() => window.open(createdLink, '_blank')}>Ouvrir</button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-[#FF8C8C]">{error}</p>}
        </section>
      </div>
    </main>
  );
}
