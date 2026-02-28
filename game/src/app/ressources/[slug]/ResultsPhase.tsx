'use client';

import { useRef } from 'react';
import { Phone, ExternalLink, RotateCcw, ChevronRight, Download } from 'lucide-react';
import type {
  Meter,
  MeterQuestion,
  SeverityLevel,
} from '@/config/meters-data';

interface ResultsPhaseProps {
  meter: Meter;
  resultLevel: SeverityLevel;
  yesByLevel: {
    green: MeterQuestion[];
    yellow: MeterQuestion[];
    orange: MeterQuestion[];
    red: MeterQuestion[];
  };
  problemCount: number;
  onRestart: () => void;
}

export function ResultsPhase({
  meter,
  resultLevel,
  yesByLevel,
  problemCount,
  onRestart,
}: ResultsPhaseProps) {
  const resultsRef = useRef<HTMLElement>(null);
  const levelInfo = meter.levels[resultLevel];

  const handleSaveResult = async () => {
    const el = resultsRef.current;
    if (!el) return;
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(el, {
        backgroundColor: '#0A0A0B',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${meter.name.replace(/\s+/g, '-').toLowerCase()}-résultat.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      window.print();
    }
  };

  return (
    <main ref={resultsRef} className="flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] scroll-smooth">
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
          onClick={handleSaveResult}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <Download size={16} /> Sauvegarder mon résultat
        </button>
        <button
          onClick={onRestart}
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

      <p className="text-[10px] text-[#4B5563] text-center mb-2 flex items-center justify-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        Tes réponses restent sur ton appareil. Rien n&apos;a été envoyé.
      </p>
      <p className="text-[10px] text-[#4B5563] text-center mb-4 max-w-sm mx-auto leading-relaxed">
        ⚠️ Ce test est à titre informatif uniquement. Il ne remplace pas un diagnostic professionnel.
        Si tu es en danger, appelle le <strong className="text-[#6B7280]">17</strong> ou le <strong className="text-[#6B7280]">3919</strong>.
      </p>
    </main>
  );
}
