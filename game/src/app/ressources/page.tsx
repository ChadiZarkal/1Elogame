'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { METERS } from '@/config/meters-data';

export default function RessourcesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-[#FAFAFA] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <button
          onClick={() => router.push('/')}
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <main className={`flex-1 flex flex-col px-5 pb-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mt-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF4444]/20 to-[#F97316]/20 border border-[#EF4444]/10 mb-4">
            <Shield size={28} className="text-[#EF4444]" />
          </div>
          <h1 className="text-[26px] font-black tracking-tight mb-2">
            Ressources & Auto-évaluation
          </h1>
          <p className="text-[#9CA3AF] text-sm max-w-sm mx-auto leading-relaxed">
            Des outils pour t&apos;aider à identifier ce que tu vis.
            Anonyme, confidentiel, et 100&nbsp;% sur ton appareil.
          </p>
        </div>

        {/* Meter cards */}
        <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
          {METERS.map((meter, idx) => (
            <button
              key={meter.slug}
              onClick={() => router.push(`/ressources/${meter.slug}`)}
              className="res-card group text-left"
              style={{
                animationDelay: `${idx * 80}ms`,
              }}
              aria-label={`Faire le ${meter.name}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0 mt-0.5">{meter.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[#FAFAFA] group-hover:text-white transition-colors">
                    {meter.name}
                  </h2>
                  <p className="text-[13px] text-[#9CA3AF] mt-0.5 leading-relaxed">
                    {meter.tagline}
                  </p>
                  <p className="text-[12px] text-[#6B7280] mt-2 leading-relaxed">
                    {meter.description}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-[#4B5563] group-hover:text-[#EF4444] transition-all flex-shrink-0 mt-2 group-hover:translate-x-1"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Emergency banner */}
        <div className="mt-8 max-w-md mx-auto w-full">
          <div className="rounded-2xl border border-[#EF4444]/15 bg-[#EF4444]/5 px-5 py-4">
            <p className="text-[13px] font-semibold text-[#EF4444] mb-2">
              🚨 En cas d&apos;urgence
            </p>
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              Si tu es en danger immédiat, appelle le <strong className="text-[#FAFAFA]">17</strong> (police)
              ou le <strong className="text-[#FAFAFA]">112</strong> (urgences européennes).
              Le <strong className="text-[#FAFAFA]">3919</strong> est disponible 24h/24
              pour les victimes de violences.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-[#4B5563] text-center mt-6 max-w-sm mx-auto leading-relaxed">
          Ces outils ne remplacent pas un accompagnement professionnel.
          Aucune donnée n&apos;est collectée ni envoyée — tout reste sur ton appareil.
        </p>
      </main>
    </div>
  );
}
