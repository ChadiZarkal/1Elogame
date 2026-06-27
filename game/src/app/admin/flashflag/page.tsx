'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

interface AdminTest {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  question_count: number;
  updated_at: string;
}

interface DraftQuestion {
  text: string;
  timeLimitSec: number;
  options: Array<{ text: string; score: 0 | 1 | 2 }>;
}

interface AdminFullTest {
  id?: string;
  name: string;
  description?: string | null;
  questions: DraftQuestion[];
}

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 20;

function buildEmptyQuestion(): DraftQuestion {
  return {
    text: '',
    timeLimitSec: 7,
    options: [
      { text: '', score: 0 },
      { text: '', score: 2 },
    ],
  };
}

function toUiErrorMessage(action: 'load' | 'create' | 'update' | 'disable', err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Erreur inconnue';

  if (/Une erreur interne est survenue/i.test(raw)) {
    if (action === 'load') {
      return 'Impossible de charger les tests standards pour le moment. Verifiez les migrations FlashFlag ou la connexion Supabase.';
    }
    if (action === 'create') {
      return 'Le test n a pas pu etre publie. Verifiez la connexion puis reessayez.';
    }
    if (action === 'update') {
      return 'La modification du test a echoue. Verifiez la connexion puis reessayez.';
    }
    return 'La desactivation a echoue. Verifiez la connexion puis reessayez.';
  }

  return raw;
}

export default function AdminFlashFlagPage() {
  const router = useRouter();

  const [tests, setTests] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    buildEmptyQuestion(),
    buildEmptyQuestion(),
    buildEmptyQuestion(),
    buildEmptyQuestion(),
    buildEmptyQuestion(),
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const activeTestsCount = useMemo(() => tests.filter((test) => test.is_active).length, [tests]);
  const inactiveTestsCount = useMemo(() => tests.length - activeTestsCount, [tests, activeTestsCount]);

  const estimatedDurationLabel = useMemo(() => {
    const totalSeconds = questions.reduce((sum, question) => sum + question.timeLimitSec, 0);
    const minutes = Math.max(1, Math.round(totalSeconds / 60));
    return minutes <= 1 ? 'environ 1 minute' : `environ ${minutes} minutes`;
  }, [questions]);

  const isEditMode = editingId !== null;

  const fetchTests = useCallback(async () => {
    setLoading(true);

    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const response = await fetch('/api/admin/flashflag', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Chargement impossible');

      setTests(json.data.tests || []);
      setError('');
    } catch (err) {
      setTests([]);
      setError(toUiErrorMessage('load', err));
    } finally {
      setLoading(false);
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    if (name.trim().length < 3) return false;
    if (questions.length < MIN_QUESTIONS || questions.length > MAX_QUESTIONS) return false;

    return questions.every((question) => {
      if (question.text.trim().length < 3) return false;
      if (!Number.isFinite(question.timeLimitSec) || question.timeLimitSec < 3 || question.timeLimitSec > 30) return false;
      if (question.options.length < 2 || question.options.length > 3) return false;
      return question.options.every((option) => option.text.trim().length > 0);
    });
  }, [name, questions]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setQuestions([
      buildEmptyQuestion(),
      buildEmptyQuestion(),
      buildEmptyQuestion(),
      buildEmptyQuestion(),
      buildEmptyQuestion(),
    ]);
  };

  const addQuestion = () => {
    setQuestions((prev) => {
      if (prev.length >= MAX_QUESTIONS) return prev;
      return [...prev, buildEmptyQuestion()];
    });
  };

  const removeQuestion = (questionIndex: number) => {
    setQuestions((prev) => {
      if (prev.length <= MIN_QUESTIONS) return prev;
      return prev.filter((_, index) => index !== questionIndex);
    });
  };

  const updateQuestionText = (questionIndex: number, text: string) => {
    setQuestions((prev) => prev.map((question, index) => (
      index === questionIndex ? { ...question, text } : question
    )));
  };

  const updateQuestionTime = (questionIndex: number, timeLimitSec: number) => {
    setQuestions((prev) => prev.map((question, index) => (
      index === questionIndex ? { ...question, timeLimitSec } : question
    )));
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    patch: Partial<{ text: string; score: 0 | 1 | 2 }>,
  ) => {
    setQuestions((prev) => prev.map((question, qIndex) => {
      if (qIndex !== questionIndex) return question;
      return {
        ...question,
        options: question.options.map((option, oIndex) => (
          oIndex === optionIndex ? { ...option, ...patch } : option
        )),
      };
    }));
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) => prev.map((question, qIndex) => {
      if (qIndex !== questionIndex || question.options.length >= 3) return question;
      return {
        ...question,
        options: [...question.options, { text: '', score: 1 }],
      };
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => prev.map((question, qIndex) => {
      if (qIndex !== questionIndex || question.options.length <= 2) return question;
      return {
        ...question,
        options: question.options.filter((_, oIndex) => oIndex !== optionIndex),
      };
    }));
  };

  const normalizeFetchedQuestions = (rawQuestions: AdminFullTest['questions']): DraftQuestion[] => {
    if (!Array.isArray(rawQuestions)) {
      return [
        buildEmptyQuestion(),
        buildEmptyQuestion(),
        buildEmptyQuestion(),
        buildEmptyQuestion(),
        buildEmptyQuestion(),
      ];
    }

    const normalized = rawQuestions
      .map((question) => {
        if (!question || typeof question !== 'object') return null;

        const options = Array.isArray(question.options)
          ? question.options
              .map((option) => {
                if (!option || typeof option !== 'object') return null;
                if (typeof option.text !== 'string') return null;
                const score = option.score;
                if (score !== 0 && score !== 1 && score !== 2) return null;
                return { text: option.text, score };
              })
              .filter((option): option is { text: string; score: 0 | 1 | 2 } => option !== null)
              .slice(0, 3)
          : [];

        if (options.length < 2) return null;

        const parsedTime = Number(question.timeLimitSec);
        return {
          text: typeof question.text === 'string' ? question.text : '',
          timeLimitSec: Number.isFinite(parsedTime) ? Math.min(30, Math.max(3, Math.round(parsedTime))) : 7,
          options,
        } satisfies DraftQuestion;
      })
      .filter((question): question is DraftQuestion => question !== null);

    if (normalized.length < MIN_QUESTIONS) {
      return [
        ...normalized,
        ...Array.from({ length: MIN_QUESTIONS - normalized.length }, () => buildEmptyQuestion()),
      ];
    }

    return normalized.slice(0, MAX_QUESTIONS);
  };

  const loadTestForEdit = async (id: string) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    setIsEditLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/flashflag/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Chargement du test impossible');

      const test = json.data.test as AdminFullTest;
      const testMeta = tests.find((item) => item.id === id);
      setEditingId(id);
      setName(test.name || '');
      setDescription(test.description || '');
      setIsActive(testMeta ? testMeta.is_active : true);
      setQuestions(normalizeFetchedQuestions(test.questions));
      setSuccess('Mode modification active: vous editez un test existant.');
    } catch (err) {
      setError(toUiErrorMessage('load', err));
    } finally {
      setIsEditLoading(false);
    }
  };

  const submitForm = async () => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    if (!canSubmit) {
      setError('Le formulaire est incomplet: verifiez nom, questions, options et temps.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const body = JSON.stringify({
      name,
      description: description || null,
      isActive,
      questions,
    });

    try {
      if (isEditMode && editingId) {
        const response = await fetch(`/api/admin/flashflag/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body,
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || 'Modification impossible');

        setSuccess('Test modifie avec succes.');
      } else {
        const response = await fetch('/api/admin/flashflag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body,
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || 'Creation impossible');

        setSuccess('Test standard publie avec succes.');
      }

      resetForm();
      await fetchTests();
    } catch (err) {
      setError(toUiErrorMessage(isEditMode ? 'update' : 'create', err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTestActive = async (id: string, nextActive: boolean) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/flashflag/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Mise a jour impossible');

      if (editingId === id) {
        setIsActive(nextActive);
      }

      setSuccess(nextActive ? 'Test reactive avec succes.' : 'Test desactive avec succes.');
      await fetchTests();
    } catch (err) {
      setError(toUiErrorMessage('update', err));
    }
  };

  const disableTest = async (id: string) => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/flashflag/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Suppression impossible');

      if (editingId === id) {
        resetForm();
      }

      setSuccess('Test desactive avec succes.');
      await fetchTests();
    } catch (err) {
      setError(toUiErrorMessage('disable', err));
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <AdminNav />

      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <header className="rounded-2xl border border-[#2F2F2F] bg-[linear-gradient(130deg,#121212_0%,#181818_65%,#2A1212_100%)] p-5 sm:p-6">
          <h1 className="text-2xl font-black tracking-tight">Admin Flash Flag</h1>
          <p className="mt-2 text-sm text-[#C4C4C4]">
            Ici vous creez et modifiez les tests standards proposes aux joueurs. L objectif est de garder un parcours clair et comprehensible.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-[#A3A3A3]">Actifs</p>
              <p className="text-lg font-bold text-emerald-300">{activeTestsCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-[#A3A3A3]">Inactifs</p>
              <p className="text-lg font-bold text-zinc-300">{inactiveTestsCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-[#A3A3A3]">Duree estimee du brouillon</p>
              <p className="text-sm font-semibold">{estimatedDurationLabel}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-900/20 p-3 text-emerald-200">
            {success}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#333] bg-[#141414] p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg">{isEditMode ? 'Modifier un test standard' : 'Creer un test standard'}</h2>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Entre {MIN_QUESTIONS} et {MAX_QUESTIONS} questions, 2 a 3 options par question, temps 3 a 30 secondes.
                </p>
              </div>
              {isEditMode && (
                <button
                  className="rounded border border-[#555] px-2.5 py-1 text-xs hover:border-[#777]"
                  onClick={resetForm}
                >
                  Quitter la modification
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="w-full rounded border border-[#333] bg-[#1B1B1B] px-3 py-2"
                placeholder="Nom du test"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="w-full rounded border border-[#333] bg-[#1B1B1B] px-3 py-2"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-[#D4D4D8]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Publier ce test comme actif
            </label>

            <div className="flex gap-2 flex-wrap">
              <button
                className="rounded border border-[#444] px-3 py-2 text-sm disabled:opacity-40"
                onClick={addQuestion}
                disabled={questions.length >= MAX_QUESTIONS}
              >
                + Question
              </button>
              <button
                className="rounded border border-[#444] px-3 py-2 text-sm"
                onClick={resetForm}
              >
                Reinitialiser le formulaire
              </button>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-xl border border-[#2D2D2D] bg-[#171717] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#A3A3A3]">Question {questionIndex + 1}</p>
                    <button
                      className="rounded border border-[#444] px-2 py-1 text-xs disabled:opacity-40"
                      disabled={questions.length <= MIN_QUESTIONS}
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <input
                    className="w-full rounded border border-[#353535] bg-[#1F1F1F] px-2 py-1.5"
                    placeholder="Texte de la question"
                    value={question.text}
                    onChange={(event) => updateQuestionText(questionIndex, event.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9CA3AF]">Temps (sec)</span>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      className="w-24 rounded border border-[#353535] bg-[#1F1F1F] px-2 py-1.5"
                      value={question.timeLimitSec}
                      onChange={(event) => updateQuestionTime(questionIndex, Number(event.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="grid grid-cols-[1fr_auto_auto] gap-2">
                        <input
                          className="rounded border border-[#353535] bg-[#1F1F1F] px-2 py-1.5"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(event) => updateOption(questionIndex, optionIndex, { text: event.target.value })}
                        />
                        <select
                          className="rounded border border-[#353535] bg-[#1F1F1F] px-2 py-1.5"
                          value={option.score}
                          onChange={(event) => updateOption(questionIndex, optionIndex, { score: Number(event.target.value) as 0 | 1 | 2 })}
                        >
                          <option value={0}>Score 0</option>
                          <option value={1}>Score 1</option>
                          <option value={2}>Score 2</option>
                        </select>
                        <button
                          className="rounded border border-[#444] px-2 py-1 text-xs disabled:opacity-40"
                          disabled={question.options.length <= 2}
                          onClick={() => removeOption(questionIndex, optionIndex)}
                        >
                          -
                        </button>
                      </div>
                    ))}

                    {question.options.length < 3 && (
                      <button
                        className="rounded border border-dashed border-[#555] px-2 py-1 text-xs"
                        onClick={() => addOption(questionIndex)}
                      >
                        Ajouter une 3e option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full rounded bg-[#DC2626] px-3 py-2 font-semibold hover:bg-[#EF4444] disabled:opacity-40"
              disabled={!canSubmit || isSubmitting || isEditLoading}
              onClick={submitForm}
            >
              {isSubmitting
                ? (isEditMode ? 'Mise a jour en cours...' : 'Publication en cours...')
                : (isEditMode ? 'Enregistrer les modifications' : 'Publier le test')}
            </button>
          </div>

          <div className="rounded-2xl border border-[#333] bg-[#141414] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-bold">Tests existants</h2>
              <button className="rounded border border-[#444] px-2.5 py-1.5 text-xs hover:border-[#666]" onClick={fetchTests}>
                Rafraichir
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[#A3A3A3]">Chargement...</p>
            ) : tests.length === 0 ? (
              <p className="text-sm text-[#A3A3A3]">Aucun test standard configure pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {tests.map((test) => (
                  <div key={test.id} className="rounded-lg border border-[#2C2C2C] bg-[#1A1A1A] p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          <span>{test.name}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] ${test.is_active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-zinc-700/50 text-zinc-300'}`}>
                            {test.is_active ? 'ACTIF' : 'INACTIF'}
                          </span>
                        </p>
                        <p className="text-xs text-[#A3A3A3]">
                          {test.question_count} questions • {test.description || 'Sans description'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="rounded border border-[#555] px-2.5 py-1.5 text-xs hover:border-[#777] disabled:opacity-40"
                        onClick={() => loadTestForEdit(test.id)}
                        disabled={isEditLoading}
                      >
                        Modifier
                      </button>
                      <button
                        className="rounded bg-[#7F1D1D] px-2.5 py-1.5 text-xs hover:bg-[#991B1B] disabled:opacity-40"
                        disabled={!test.is_active}
                        onClick={() => disableTest(test.id)}
                      >
                        {test.is_active ? 'Desactiver' : 'Desactive'}
                      </button>
                      {!test.is_active && (
                        <button
                          className="rounded border border-emerald-700 bg-emerald-900/30 px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-emerald-900/50"
                          onClick={() => setTestActive(test.id, true)}
                        >
                          Reactiver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
