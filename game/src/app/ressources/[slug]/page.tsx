'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
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

  const handleShareResult = () => {
    const shareText = `${meter.emoji} J'ai fait le ${meter.name} sur Red or Green !\nRésultat : ${levelInfo.title}\n\nFais le test toi aussi →`;
    if (navigator.share) {
      navigator.share({ text: shareText, url: `https://redflaggames.fr/ressources/${slug}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} https://redflaggames.fr/ressources/${slug}`).catch(() => {});
    }
  };

  const resultLevel = phase === 'results' ? getHighestSeverity(answers, meter.questions) : 'green';
  const levelInfo = meter.levels[resultLevel];
  const yesByLevel = phase === 'results' ? getYesAnswersByLevel(answers, meter.questions) : null;

  // Count how many non-green "yes" answers
  const problemCount = yesByLevel
    ? yesByLevel.yellow.length + yesByLevel.orange.length + yesByLevel.red.length
    : 0;

  // Score percentage (% of questions answered "yes" that are not green)
  const totalAnswered = answers.size;
  const yesCount = Array.from(answers.values()).filter(Boolean).length;
  const scorePercent = totalAnswered > 0 ? Math.round((problemCount / totalAnswered) * 100) : 0;

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
              router.push('/ressources');
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
      )}

      {/* ═══ INTRO ═══ */}
      {phase === 'intro' && (
        <main className="flex-1 flex flex-col items-center justify-center px-6 animate-page-in">
          <span className="text-6xl mb-6">{meter.emoji}</span>
          <h2 className="text-[24px] font-black text-center mb-3">{meter.name}</h2>
          <p className="text-[#9CA3AF] text-sm text-center max-w-xs mb-2 leading-relaxed">
            {meter.description}
          </p>
          <p className="text-[#6B7280] text-[12px] text-center max-w-xs mb-4 leading-relaxed">
            {meter.intro}
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-1.5 mb-6 text-[11px] text-[#4B5563]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Déjà fait par des milliers de personnes</span>
          </div>

          {/* What to expect indicators */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[10px] text-[#6B7280]">Sain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] text-[#6B7280]">Vigilance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span className="text-[10px] text-[#6B7280]">Alerte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] text-[#6B7280]">Danger</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setPhase('quiz')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-bold text-base active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
            >
              Commencer le test
              <ChevronRight size={18} />
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
          <p className="text-[11px] text-[#4B5563] text-center mt-3 mb-1 italic">
            {meter.questionPrefix}
          </p>

          {/* Safe exit hint (only on first question) */}
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
                onClick={() => handleAnswer(true)}
                className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.93] active:bg-[#EF4444]/10 hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 transition-all group/btn"
              >
                <span className="group-hover/btn:scale-110 inline-block transition-transform mr-1">👍</span> Oui
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-bold text-base active:scale-[0.93] active:bg-[#10B981]/10 hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-all group/btn"
              >
                <span className="group-hover/btn:scale-110 inline-block transition-transform mr-1">👎</span> Non
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === 'results' && yesByLevel && (
        <main className="flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] scroll-smooth">
          {/* Result header */}
          <div className="text-center mt-6 mb-6">
            <div className="relative inline-block mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${levelInfo.color}20, ${levelInfo.color}08)`,
                  border: `2px solid ${levelInfo.color}30`,
                }}
              >
                <span className="text-4xl">{levelInfo.emoji}</span>
              </div>
              {/* Glow ring */}
              <div
                className="absolute inset-[-4px] rounded-full opacity-40"
                style={{ boxShadow: `0 0 20px ${levelInfo.color}25` }}
              />
            </div>
            {problemCount > 0 && (
              <div className="mb-3">
                <p className="text-[13px] font-bold mb-2" style={{ color: levelInfo.color }}>
                  {problemCount} situation{problemCount > 1 ? 's' : ''} identifiée{problemCount > 1 ? 's' : ''}
                </p>
                {/* Mini severity distribution bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden max-w-[200px] mx-auto gap-0.5">
                  {yesByLevel.red.length > 0 && (
                    <div className="bg-[#EF4444] rounded-full" style={{ flex: yesByLevel.red.length }} />
                  )}
                  {yesByLevel.orange.length > 0 && (
                    <div className="bg-[#F97316] rounded-full" style={{ flex: yesByLevel.orange.length }} />
                  )}
                  {yesByLevel.yellow.length > 0 && (
                    <div className="bg-[#F59E0B] rounded-full" style={{ flex: yesByLevel.yellow.length }} />
                  )}
                  {yesByLevel.green.length > 0 && (
                    <div className="bg-[#10B981] rounded-full" style={{ flex: yesByLevel.green.length }} />
                  )}
                </div>
              </div>
            )}
            <h2
              className="text-[20px] font-black mb-2 tracking-tight"
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
            className="rounded-2xl px-5 py-4 mb-6 max-w-md mx-auto relative overflow-hidden"
            style={{ backgroundColor: `${levelInfo.color}08`, border: `1px solid ${levelInfo.color}15` }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-r"
              style={{ backgroundColor: levelInfo.color }}
            />
            <p className="text-[13px] font-semibold mb-1.5 pl-2" style={{ color: levelInfo.color }}>
              💡 Conseil
            </p>
            <p className="text-[13px] text-[#D1D5DB] leading-relaxed pl-2">{levelInfo.advice}</p>
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
                        className="w-1 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <span
                        className="text-[12px] font-bold uppercase tracking-wider"
                        style={{ color: info.color }}
                      >
                        {info.label} · {items.length}
                      </span>
                    </div>
                    <div className="space-y-1 pl-3.5 border-l border-[#1E1E1E]">
                      {items.map((q) => (
                        <p key={q.id} className="text-[12px] text-[#9CA3AF] leading-relaxed pl-2">
                          {q.negatedText || q.text}
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

            {/* Priority resources with phone numbers */}
            <div className="space-y-2 mb-3">
              {meter.resources.filter(r => r.number).map((res, i) => (
                <div
                  key={`phone-${i}`}
                  className="rounded-xl bg-[#111] border border-[#1E1E1E] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#FAFAFA] truncate">{res.name}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed line-clamp-2">{res.description}</p>
                    </div>
                    <a
                      href={`tel:${res.number!.replace(/\s/g, '')}`}
                      className="flex-shrink-0 flex items-center gap-1 text-[12px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-lg hover:bg-[#10B981]/20 transition-colors active:scale-95"
                    >
                      <Phone size={12} /> Appeler
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Web resources */}
            {meter.resources.filter(r => !r.number && r.url).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#4B5563] font-semibold uppercase tracking-wider mb-1">
                  Sites utiles
                </p>
                {meter.resources.filter(r => !r.number && r.url).map((res, i) => (
                  <a
                    key={`web-${i}`}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#111] border border-[#1E1E1E] px-3 py-2.5 hover:border-[#60A5FA]/20 transition-colors active:scale-[0.98] group"
                  >
                    <ExternalLink size={12} className="text-[#60A5FA] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#D1D5DB] group-hover:text-[#60A5FA] transition-colors truncate">{res.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 max-w-md mx-auto mb-4">
            <button
              onClick={handleShareResult}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              📤 Partager mon résultat
            </button>
            <button
              onClick={handleRestart}
              className="w-full py-3.5 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-[#FAFAFA] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-[#3A3A3A]"
            >
              <RotateCcw size={14} /> Recommencer
            </button>
            <a
              href="/ressources"
              className="w-full py-3 rounded-2xl text-[#9CA3AF] font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:text-white"
            >
              Essayer un autre test <ChevronRight size={14} />
            </a>
          </div>

          <p className="text-[10px] text-[#4B5563] text-center mb-4 flex items-center justify-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Tes réponses restent sur ton appareil. Rien n&apos;a été envoyé.
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
