'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export default function FlashFlagSessionPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionIndex: number; questionText: string; selectedOption: string | null; selectedScore: 0 | 1 | 2; timedOut: boolean; timeSpentMs: number }>>([]);
  const [doneSummary, setDoneSummary] = useState<{ totalScore: number; maxScore: number; answeredCount: number; timedOutCount: number; riskPercent: number; riskLabel: string } | null>(null);

  const startedAtRef = useRef<number>(0);

  const currentQuestion = session?.test.questions[index] || null;
  const totalQuestions = session?.test.questions.length || 0;

  useEffect(() => {
    fetch(`/api/flashflag/session/${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.error?.message || 'Session introuvable');
        setSession(d.data as SessionData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  }, [code]);

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((index / totalQuestions) * 100);
  }, [index, totalQuestions]);

  const launch = async () => {
    setError('');
    try {
      await fetch(`/api/flashflag/session/${code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ started: true }),
      });
      setStarted(true);
    } catch {
      setError('Impossible de lancer la session');
    }
  };

  const submitAll = useCallback(async (payload: Array<{ questionIndex: number; questionText: string; selectedOption: string | null; selectedScore: 0 | 1 | 2; timedOut: boolean; timeSpentMs: number }>) => {
    try {
      const res = await fetch(`/api/flashflag/session/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Soumission impossible');
      setDoneSummary(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur finale');
    }
  }, [code]);

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

    setIndex((v) => v + 1);
  }, [answers, currentQuestion, index, totalQuestions, submitAll]);

  const onTimeout = useCallback(() => {
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

  const onSelect = (opt: { text: string; score: 0 | 1 | 2 }) => {
    pushAnswer(opt.text, opt.score, false);
  };

  if (loading) return <main className="min-h-screen bg-[#0D0D0D] text-white p-6">Chargement...</main>;
  if (error && !session) return <main className="min-h-screen bg-[#0D0D0D] text-white p-6">{error}</main>;
  if (!session) return <main className="min-h-screen bg-[#0D0D0D] text-white p-6">Session absente</main>;

  if (session.status === 'completed' && !doneSummary) {
    const percent = session.score.max > 0 ? Math.round((session.score.total / session.score.max) * 100) : 0;
    return (
      <main className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-[#3A3A3A] bg-[#171717] p-5 space-y-3">
          <h1 className="text-2xl font-black">Resultat deja disponible</h1>
          <p>Score: {session.score.total}/{session.score.max} ({percent}%)</p>
          <p>Reponses: {session.score.answered} | Timeout: {session.score.timedOut}</p>
        </div>
      </main>
    );
  }

  if (doneSummary) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <header className="rounded-2xl border border-[#3A3A3A] bg-[#171717] p-5 space-y-2">
            <h1 className="text-3xl font-black">Test termine</h1>
            <p className="text-[#E4E4E7]">Score red flag: {doneSummary.totalScore}/{doneSummary.maxScore} ({doneSummary.riskPercent}%)</p>
            <p className="text-[#FCA5A5]">Niveau: {doneSummary.riskLabel}</p>
            <p className="text-sm text-[#A3A3A3]">Reponses donnees: {doneSummary.answeredCount} | Timeout: {doneSummary.timedOutCount}</p>
          </header>

          <section className="rounded-2xl border border-[#3A3A3A] bg-[#171717] p-5">
            <h2 className="font-bold mb-3">Recap des reponses</h2>
            <div className="space-y-2">
              {answers.map((ans, i) => (
                <div key={i} className="rounded-lg border border-[#333] bg-[#1E1E1E] p-3">
                  <p className="text-sm text-[#F5F5F5]">Q{i + 1}. {ans.questionText}</p>
                  <p className="text-xs text-[#D4D4D8] mt-1">
                    {ans.timedOut ? 'Temps ecoule (0 point)' : `Reponse: ${ans.selectedOption} (${ans.selectedScore} point${ans.selectedScore > 1 ? 's' : ''})`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <a href="/flashflag" className="inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
          <span>←</span>
          <span>Retour preparation</span>
        </a>

        {!started ? (
          <section className="rounded-2xl border border-[#3A3A3A] bg-[#171717] p-5 space-y-4">
            <h1 className="text-2xl font-black">Attention</h1>
            <p className="text-[#D4D4D8]">Ce test est chronometre. Aucun retour arriere. Sans reponse dans le temps, la question compte comme mauvaise.</p>
            <button className="w-full rounded-xl bg-[#E1492F] hover:bg-[#F15F47] px-4 py-3 font-bold" onClick={launch}>Commencer</button>
          </section>
        ) : (
          <>
            <header className="rounded-xl border border-[#3A3A3A] bg-[#171717] p-3">
              <p className="text-xs text-[#D4D4D8]">Question {index + 1}/{totalQuestions}</p>
              <div className="w-full bg-[#2A2A2A] rounded-full h-2 mt-2 overflow-hidden">
                <div className="h-full bg-[#DC2626]" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs mt-2 text-[#FCA5A5]">Temps restant: {(remainingMs / 1000).toFixed(1)}s</p>
            </header>

            {currentQuestion && (
              <section className="rounded-2xl border border-[#3A3A3A] bg-[#171717] p-5 space-y-4">
                <h2 className="text-xl font-bold">{currentQuestion.text}</h2>
                <div className="grid gap-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <button key={idx} className="text-left rounded-lg border border-[#444] bg-[#1F1F1F] hover:bg-[#27272A] px-3 py-2" onClick={() => onSelect(opt)}>
                      {opt.text}
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
