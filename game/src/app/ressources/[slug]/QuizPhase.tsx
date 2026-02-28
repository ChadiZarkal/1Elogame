'use client';

import type { MeterQuestion, SeverityLevel } from '@/config/meters-data';

interface QuizPhaseProps {
  meter: { questionPrefix: string };
  currentIdx: number;
  totalQuestions: number;
  currentQuestion: MeterQuestion;
  animDir: 'in' | 'out';
  progress: number;
  onAnswer: (isYes: boolean) => void;
}

function getLevelColor(level: SeverityLevel): string {
  switch (level) {
    case 'green': return '#10B981';
    case 'yellow': return '#F59E0B';
    case 'orange': return '#F97316';
    case 'red': return '#EF4444';
  }
}

export function QuizPhase({
  meter,
  currentIdx,
  totalQuestions,
  currentQuestion,
  animDir,
  progress,
  onAnswer,
}: QuizPhaseProps) {
  return (
    <>
      {/* Progress bar */}
      <div className="px-4 mb-2">
        <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: getLevelColor(currentQuestion.level),
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: getLevelColor(currentQuestion.level),
              backgroundColor: `${getLevelColor(currentQuestion.level)}15`,
            }}
          >
            {currentQuestion.level === 'green' ? 'Zone saine' :
             currentQuestion.level === 'yellow' ? 'Vigilance' :
             currentQuestion.level === 'orange' ? 'Alerte' : 'Danger'}
          </span>
          <p className="text-[11px] text-[#4B5563]">
            {currentIdx + 1} / {totalQuestions}
          </p>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-5">
        {/* Question prefix */}
        <p className="text-[11px] text-[#4B5563] text-center mt-3 mb-1 italic">
          {meter.questionPrefix}
        </p>

        {/* Safe exit hint */}
        {currentIdx === 0 && (
          <p className="text-[10px] text-[#374151] text-center mb-1 animate-pulse">
            Tu peux quitter à tout moment avec le bouton ✕ en haut
          </p>
        )}

        {/* Question card */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`quiz-card transition-all duration-200 ${
              animDir === 'in' ? 'quiz-card--enter' : 'quiz-card--exit'
            }`}
            style={{
              boxShadow: `0 0 40px ${getLevelColor(currentQuestion.level)}08`,
              borderColor: `${getLevelColor(currentQuestion.level)}20`,
            }}
          >
            <div className="quiz-card__level-indicator" style={{ backgroundColor: getLevelColor(currentQuestion.level) }} />
            <p className="text-[17px] sm:text-[19px] font-semibold text-center leading-relaxed px-2">
              {currentQuestion.text}
            </p>
            <p className="text-[11px] text-[#4B5563] text-center mt-4">
              Question {currentIdx + 1} sur {totalQuestions}
            </p>
          </div>
        </div>

        {/* Answer buttons */}
        <div className="pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
          <div className="flex gap-3 max-w-sm mx-auto">
            <button
              onClick={() => onAnswer(true)}
              className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.93] active:bg-[#EF4444]/10 hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 transition-all group/btn"
            >
              <span className="group-hover/btn:scale-110 inline-block transition-transform mr-1">👍</span> Oui
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.93] active:bg-[#10B981]/10 hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-all group/btn"
            >
              <span className="group-hover/btn:scale-110 inline-block transition-transform mr-1">👎</span> Non
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
