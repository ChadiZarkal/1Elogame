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

export default function AdminFlashFlagPage() {
  const router = useRouter();
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    { text: '', timeLimitSec: 7, options: [{ text: '', score: 0 }, { text: '', score: 2 }] },
  ]);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const res = await fetch('/api/admin/flashflag', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Chargement impossible');
      setTests(json.data.tests || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    if (name.trim().length < 3) return false;
    if (questions.length === 0 || questions.length > 20) return false;

    return questions.every((q) => {
      if (q.text.trim().length < 3) return false;
      if (!Number.isFinite(q.timeLimitSec) || q.timeLimitSec < 3 || q.timeLimitSec > 30) return false;
      if (q.options.length < 2 || q.options.length > 3) return false;
      return q.options.every((opt) => opt.text.trim().length > 0);
    });
  }, [name, questions]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions((prev) => [...prev, { text: '', timeLimitSec: 7, options: [{ text: '', score: 0 }, { text: '', score: 2 }] }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, text } : q));
  };

  const updateQuestionTime = (idx: number, timeLimitSec: number) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, timeLimitSec } : q));
  };

  const updateOption = (qIdx: number, oIdx: number, patch: Partial<{ text: string; score: 0 | 1 | 2 }>) => {
    setQuestions((prev) => prev.map((q, i) => i !== qIdx ? q : ({
      ...q,
      options: q.options.map((opt, j) => j !== oIdx ? opt : { ...opt, ...patch }),
    })));
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx || q.options.length >= 3) return q;
      return { ...q, options: [...q.options, { text: '', score: 1 }] };
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIdx || q.options.length <= 2) return q;
      return { ...q, options: q.options.filter((_, j) => j !== oIdx) };
    }));
  };

  const createTest = async () => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    if (!canSubmit) {
      setError('Le brouillon est incomplet: completez les champs requis (nom, questions, options, temps).');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/flashflag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || null,
          isActive: true,
          questions,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Creation impossible');

      setName('');
      setDescription('');
      setQuestions([{ text: '', timeLimitSec: 7, options: [{ text: '', score: 0 }, { text: '', score: 2 }] }]);
      setSuccess('Test standard publie avec succes.');
      await fetchTests();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setIsSubmitting(false);
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
      const res = await fetch(`/api/admin/flashflag/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Suppression impossible');
      setSuccess('Test desactive avec succes.');
      await fetchTests();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-black">⚡ Admin Flash Flag</h1>
          <p className="text-sm text-[#9CA3AF]">Gestion des tests standards chronometres.</p>
        </header>

        {error && <div className="rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-red-200">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-500/40 bg-emerald-900/20 p-3 text-emerald-200">{success}</div>}

        <section className="rounded-xl border border-[#333] bg-[#141414] p-4 space-y-4">
          <h2 className="font-bold">Creer un test standard</h2>
          <input className="w-full rounded bg-[#1B1B1B] border border-[#333] px-3 py-2" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded bg-[#1B1B1B] border border-[#333] px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="space-y-3">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-lg border border-[#2D2D2D] bg-[#171717] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-[#A3A3A3]">Question {qIdx + 1}</p>
                  <button
                    className="text-xs px-2 py-1 border border-[#444] rounded disabled:opacity-40"
                    disabled={questions.length <= 1}
                    onClick={() => removeQuestion(qIdx)}
                  >
                    Supprimer
                  </button>
                </div>
                <input className="w-full rounded bg-[#1F1F1F] border border-[#353535] px-2 py-1.5" placeholder="Texte" value={q.text} onChange={(e) => updateQuestionText(qIdx, e.target.value)} />
                <input type="number" className="w-24 rounded bg-[#1F1F1F] border border-[#353535] px-2 py-1.5" value={q.timeLimitSec} min={3} max={30} onChange={(e) => updateQuestionTime(qIdx, Number(e.target.value))} />
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-2">
                      <input className="flex-1 rounded bg-[#1F1F1F] border border-[#353535] px-2 py-1.5" placeholder={`Option ${oIdx + 1}`} value={opt.text} onChange={(e) => updateOption(qIdx, oIdx, { text: e.target.value })} />
                      <select className="rounded bg-[#1F1F1F] border border-[#353535] px-2 py-1.5" value={opt.score} onChange={(e) => updateOption(qIdx, oIdx, { score: Number(e.target.value) as 0 | 1 | 2 })}>
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                      <button
                        className="px-2 py-1 rounded border border-[#444] text-xs disabled:opacity-40"
                        disabled={q.options.length <= 2}
                        onClick={() => removeOption(qIdx, oIdx)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
                {q.options.length < 3 && (
                  <button className="text-xs px-2 py-1 border border-dashed border-[#555] rounded" onClick={() => addOption(qIdx)}>
                    Ajouter option
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-[#9CA3AF]">Contraintes: 1 a 20 questions, 2 a 3 options par question, temps de 3 a 30 secondes.</p>

          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-2 rounded border border-[#444] disabled:opacity-40" disabled={questions.length >= 20} onClick={addQuestion}>+ Question</button>
            <button className="px-3 py-2 rounded bg-[#DC2626] hover:bg-[#EF4444] disabled:opacity-40" disabled={!canSubmit || isSubmitting} onClick={createTest}>{isSubmitting ? 'Publication...' : 'Publier'}</button>
          </div>
        </section>

        <section className="rounded-xl border border-[#333] bg-[#141414] p-4">
          <h2 className="font-bold mb-3">Tests existants</h2>
          {loading ? (
            <p className="text-sm text-[#A3A3A3]">Chargement...</p>
          ) : (
            <div className="space-y-2">
              {tests.map((test) => (
                <div key={test.id} className="rounded-lg border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <span>{test.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${test.is_active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-zinc-700/50 text-zinc-300'}`}>
                        {test.is_active ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </p>
                    <p className="text-xs text-[#A3A3A3]">{test.question_count} questions • {test.description || 'Sans description'}</p>
                  </div>
                  <button className="px-2.5 py-1.5 rounded bg-[#7F1D1D] hover:bg-[#991B1B] text-sm disabled:opacity-40" disabled={!test.is_active} onClick={() => disableTest(test.id)}>
                    {test.is_active ? 'Desactiver' : 'Desactive'}
                  </button>
                </div>
              ))}
              {tests.length === 0 && <p className="text-sm text-[#A3A3A3]">Aucun test pour le moment.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
