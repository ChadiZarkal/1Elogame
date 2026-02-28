'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  getMeterBySlug,
  getHighestSeverity,
  getYesAnswersByLevel,
} from '@/config/meters-data';
import { IntroPhase } from './IntroPhase';

// Lazy-load heavier phases — only downloaded when the user reaches them
const QuizPhase = lazy(() => import('./QuizPhase').then(m => ({ default: m.QuizPhase })));
const ResultsPhase = lazy(() => import('./ResultsPhase').then(m => ({ default: m.ResultsPhase })));

type Phase = 'intro' | 'quiz' | 'results';

function PhaseFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-[#6B7280] animate-pulse">Chargement…</p>
    </div>
  );
}

export default function MeterQuizPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const meter = useMemo(() => getMeterBySlug(slug), [slug]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');

  // ── Redirect if unknown slug ──
  useEffect(() => {
    if (!meter) router.replace('/ressources');
  }, [meter, router]);

  if (!meter) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0B] flex items-center justify-center">
        <p className="text-[#6B7280]">Chargement…</p>
      </div>
    );
  }

  const totalQuestions = meter.questions.length;
  const progress = phase === 'quiz' ? ((currentIdx + 1) / totalQuestions) * 100 : 0;
  const currentQuestion = meter.questions[currentIdx];

  // ── Handlers ──
  const handleAnswer = (isYes: boolean) => {
    setAnimDir('out');
    setTimeout(() => {
      const next = new Map(answers);
      next.set(currentQuestion.id, isYes);
      setAnswers(next);

      if (currentIdx + 1 < totalQuestions) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setPhase('results');
      }
      setAnimDir('in');
    }, 200);
  };

  const handleRestart = () => {
    setAnswers(new Map());
    setCurrentIdx(0);
    setPhase('intro');
  };

  const resultLevel = phase === 'results' ? getHighestSeverity(answers, meter.questions) : 'green';
  const yesByLevel = phase === 'results' ? getYesAnswersByLevel(answers, meter.questions) : null;

  const problemCount = yesByLevel
    ? yesByLevel.yellow.length + yesByLevel.orange.length + yesByLevel.red.length
    : 0;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-[#FAFAFA] flex flex-col relative overflow-hidden">
      {/* Subtle ambient gradient */}
      {phase === 'intro' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-[#EF4444]/5 to-transparent rounded-full blur-3xl" />
        </div>
      )}
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 relative z-20">
        <button
          onClick={() => {
            if (phase === 'quiz') {
              if (currentIdx > 0) {
                setCurrentIdx(currentIdx - 1);
              } else {
                setPhase('intro');
              }
            } else if (phase === 'results') {
              setPhase('intro');
            } else {
              window.location.href = '/ressources';
            }
          }}
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour"
        >
          <ArrowLeft size={16} /> {phase === 'intro' ? 'Ressources' : 'Retour'}
        </button>

        <h1 className="text-sm font-bold text-[#FAFAFA] tracking-tight absolute left-1/2 -translate-x-1/2">
          <span className="mr-1">{meter.emoji}</span>{meter.name}
        </h1>

        {/* Quick exit button */}
        <a
          href="/"
          className="text-[10px] text-[#4B5563] hover:text-[#EF4444] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-end active:scale-95"
          aria-label="Quitter rapidement"
          title="Quitter rapidement"
        >
          ✕ Quitter
        </a>
      </div>

      {/* ═══ INTRO ═══ */}
      {phase === 'intro' && (
        <IntroPhase
          meter={meter}
          totalQuestions={totalQuestions}
          onStart={() => setPhase('quiz')}
        />
      )}

      {/* ═══ QUIZ ═══ (lazy-loaded) */}
      {phase === 'quiz' && (
        <Suspense fallback={<PhaseFallback />}>
          <QuizPhase
            meter={meter}
            currentIdx={currentIdx}
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestion}
            animDir={animDir}
            progress={progress}
            onAnswer={handleAnswer}
          />
        </Suspense>
      )}

      {/* ═══ RESULTS ═══ (lazy-loaded) */}
      {phase === 'results' && yesByLevel && (
        <Suspense fallback={<PhaseFallback />}>
          <ResultsPhase
            meter={meter}
            resultLevel={resultLevel}
            yesByLevel={yesByLevel}
            problemCount={problemCount}
            onRestart={handleRestart}
          />
        </Suspense>
      )}
    </div>
  );
}
