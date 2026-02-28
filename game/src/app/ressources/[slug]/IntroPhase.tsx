'use client';

import { ChevronRight } from 'lucide-react';
import type { Meter } from '@/config/meters-data';

interface IntroPhaseProps {
  meter: Meter;
  totalQuestions: number;
  onStart: () => void;
}

export function IntroPhase({ meter, totalQuestions, onStart }: IntroPhaseProps) {
  return (
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

      {/* Legend */}
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
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-bold text-base active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
        >
          Commencer le test
          <ChevronRight size={18} />
        </button>
        <p className="text-[11px] text-[#4B5563] text-center">
          {totalQuestions} questions · ~{Math.ceil(totalQuestions / 4)} min · 100% anonyme
        </p>
      </div>

      {/* Disclaimer & age warning */}
      <div className="mt-4 w-full max-w-xs mx-auto space-y-2">
        <p className="text-[10px] text-[#4B5563] text-center leading-relaxed">
          ⚠️ Cet outil est fourni à <strong className="text-[#6B7280]">titre informatif uniquement</strong>.
          Il ne constitue en aucun cas un diagnostic médical, psychologique ou juridique et ne remplace pas l&apos;avis d&apos;un professionnel.
        </p>
        <p className="text-[10px] text-[#4B5563] text-center">
          🔞 Réservé aux personnes de <strong className="text-[#6B7280]">16 ans et plus</strong>.
        </p>
      </div>
    </main>
  );
}
