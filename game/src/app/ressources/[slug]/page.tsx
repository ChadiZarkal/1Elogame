'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, Phone, ExternalLink, RotateCcw, ChevronRight } from 'lucide-react';
import {
  getMeterBySlug,
  getHighestSeverity,
  getYesAnswersByLevel,
  type SeverityLevel,
  type MeterQuestion,
} from '@/config/meters-data';

type Phase = 'intro' | 'quiz' | 'results';

export default function MeterQuizPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const meter = useMemo(() => getMeterBySlug(slug), [slug]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Redirect if unknown slug ──
  useEffect(() => {
    if (mounted && !meter) router.replace('/ressources');
  }, [mounted, meter, router]);

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
  const levelInfo = meter.levels[resultLevel];
  const yesByLevel = phase === 'results' ? getYesAnswersByLevel(answers, meter.questions) : null;

  // Count how many non-green "yes" answers
  const problemCount = yesByLevel
    ? yesByLevel.yellow.length + yesByLevel.orange.length + yesByLevel.red.length
    : 0;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-[#FAFAFA] flex flex-col">
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
              router.push('/ressources');
            }
          }}
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour"
        >
          <ArrowLeft size={16} /> {phase === 'intro' ? 'Ressources' : 'Retour'}
        </button>

        <h1 className="text-sm font-bold text-[#FAFAFA] tracking-tight">
          {meter.emoji} {meter.name}
        </h1>

        {/* Quick exit button */}
        <button
          onClick={() => router.push('/')}
          className="text-[10px] text-[#4B5563] hover:text-[#EF4444] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-end active:scale-95"
          aria-label="Quitter rapidement"
          title="Quitter rapidement"
        >
          ✕ Quitter
        </button>
      </div>

      {/* Progress bar (quiz only) */}
      {phase === 'quiz' && (
        <div className="px-4 mb-2">
          <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: currentQuestion.level === 'green' ? '#10B981'
                  : currentQuestion.level === 'yellow' ? '#F59E0B'
                  : currentQuestion.level === 'orange' ? '#F97316'
                  : '#EF4444',
              }}
            />
          </div>
          <p className="text-[11px] text-[#4B5563] text-right mt-1">
            {currentIdx + 1} / {totalQuestions}
          </p>
        </div>
      )}

      {/* ═══ INTRO ═══ */}
      {phase === 'intro' && (
        <main className={`flex-1 flex flex-col items-center justify-center px-6 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-6xl mb-6">{meter.emoji}</span>
          <h2 className="text-[24px] font-black text-center mb-3">{meter.name}</h2>
          <p className="text-[#9CA3AF] text-sm text-center max-w-xs mb-2 leading-relaxed">
            {meter.description}
          </p>
          <p className="text-[#6B7280] text-[12px] text-center max-w-xs mb-8 leading-relaxed">
            {meter.intro}
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setPhase('quiz')}
              className="w-full py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-base active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              Commencer le test
            </button>
            <p className="text-[11px] text-[#4B5563] text-center">
              {totalQuestions} questions · ~{Math.ceil(totalQuestions / 4)} min · 100% anonyme
            </p>
          </div>
        </main>
      )}

      {/* ═══ QUIZ ═══ */}
      {phase === 'quiz' && (
        <main className="flex-1 flex flex-col px-5">
          {/* Question prefix */}
          <p className="text-[12px] text-[#6B7280] text-center mt-4 mb-2">
            {meter.questionPrefix}
          </p>

          {/* Question card */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`quiz-card transition-all duration-200 ${
                animDir === 'in' ? 'quiz-card--enter' : 'quiz-card--exit'
              }`}
            >
              <div className="quiz-card__level-indicator" style={{ backgroundColor: getLevelColor(currentQuestion.level) }} />
              <p className="text-[18px] sm:text-[20px] font-semibold text-center leading-relaxed px-2">
                {currentQuestion.text}
              </p>
            </div>
          </div>

          {/* Answer buttons */}
          <div className="pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.95] hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 transition-all"
              >
                Oui
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.95] hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-all"
              >
                Non
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === 'results' && yesByLevel && (
        <main className="flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          {/* Result header */}
          <div className="text-center mt-6 mb-6">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: `${levelInfo.color}15`, border: `2px solid ${levelInfo.color}30` }}
            >
              <span className="text-4xl">{levelInfo.emoji}</span>
            </div>
            <h2
              className="text-[22px] font-black mb-2"
              style={{ color: levelInfo.color }}
            >
              {levelInfo.title}
            </h2>
            <p className="text-[#D1D5DB] text-sm leading-relaxed max-w-sm mx-auto">
              {levelInfo.message}
            </p>
          </div>

          {/* Advice box */}
          <div
            className="rounded-2xl px-5 py-4 mb-6 max-w-md mx-auto"
            style={{ backgroundColor: `${levelInfo.color}10`, border: `1px solid ${levelInfo.color}20` }}
          >
            <p className="text-[13px] font-semibold mb-1" style={{ color: levelInfo.color }}>
              💡 Conseil
            </p>
            <p className="text-[13px] text-[#D1D5DB] leading-relaxed">{levelInfo.advice}</p>
          </div>

          {/* Breakdown of answers */}
          {problemCount > 0 && (
            <div className="mb-6 max-w-md mx-auto">
              <h3 className="text-[14px] font-bold text-[#9CA3AF] mb-3">
                Situations identifiées
              </h3>

              {(['red', 'orange', 'yellow'] as SeverityLevel[]).map((level) => {
                const items = yesByLevel[level];
                if (items.length === 0) return null;
                const info = meter.levels[level];
                return (
                  <div key={level} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <span
                        className="text-[12px] font-bold uppercase tracking-wider"
                        style={{ color: info.color }}
                      >
                        {info.label}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-5">
                      {items.map((q) => (
                        <p key={q.id} className="text-[12px] text-[#9CA3AF] leading-relaxed">
                          • {q.text}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resources */}
          <div className="mb-6 max-w-md mx-auto">
            <h3 className="text-[14px] font-bold text-[#9CA3AF] mb-3">
              📞 Ressources & contacts
            </h3>
            <div className="space-y-2">
              {meter.resources.map((res, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#111] border border-[#1E1E1E] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#FAFAFA]">{res.name}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{res.description}</p>
                    </div>
                    {res.number && (
                      <a
                        href={`tel:${res.number.replace(/\s/g, '')}`}
                        className="flex-shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg hover:bg-[#10B981]/20 transition-colors active:scale-95"
                      >
                        <Phone size={12} /> Appeler
                      </a>
                    )}
                    {!res.number && res.url && (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#60A5FA] bg-[#60A5FA]/10 px-3 py-1.5 rounded-lg hover:bg-[#60A5FA]/20 transition-colors active:scale-95"
                      >
                        <ExternalLink size={12} /> Voir
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 max-w-md mx-auto mb-4">
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-[#3A3A3A]"
            >
              <RotateCcw size={14} /> Recommencer le test
            </button>
            <button
              onClick={() => router.push('/ressources')}
              className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-[#3A3A3A]"
            >
              Essayer un autre test <ChevronRight size={14} />
            </button>
          </div>

          <p className="text-[10px] text-[#4B5563] text-center mb-4">
            Aucune donnée n&apos;a été collectée. Tes réponses restent sur ton appareil.
          </p>
        </main>
      )}
    </div>
  );
}

function getLevelColor(level: SeverityLevel): string {
  switch (level) {
    case 'green': return '#10B981';
    case 'yellow': return '#F59E0B';
    case 'orange': return '#F97316';
    case 'red': return '#EF4444';
  }
}
