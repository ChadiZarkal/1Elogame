'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import { METERS } from '@/config/meters-data';

const METER_COLORS: Record<string, string> = {
  violentometre: '#EF4444',
  consentometre: '#F59E0B',
  incestometre: '#8B5CF6',
  harcelometre: '#3B82F6',
  discriminometre: '#F97316',
};

export default function RessourcesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-[#FAFAFA] flex flex-col relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EF4444]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#F97316]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <a
          href="/"
          className="text-[#6B7280] hover:text-white transition-colors text-sm flex items-center gap-1 min-w-[48px] min-h-[48px] justify-start active:scale-95"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft size={16} /> Retour
        </a>
      </div>

      <main className={`flex-1 flex flex-col px-5 pb-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mt-2 mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EF4444]/20 to-[#F97316]/20 border border-[#EF4444]/10 mb-3">
            <Shield size={24} className="text-[#EF4444]" />
          </div>
          <h1 className="text-[22px] font-black tracking-tight mb-1.5">
            Ressources & Auto-évaluation
          </h1>
          <p className="text-[#9CA3AF] text-[13px] max-w-sm mx-auto leading-relaxed">
            Des outils pour t&apos;aider à identifier ce que tu vis.
            100&nbsp;% anonyme et sur ton appareil.
          </p>
        </div>

        {/* Meter cards */}
        <div className="flex flex-col gap-2.5 max-w-md mx-auto w-full" role="list">
          {METERS.map((meter, idx) => (
            <a
              key={meter.slug}
              href={`/ressources/${meter.slug}`}
              className="res-card group text-left"
              role="listitem"
              style={{
                animationDelay: `${idx * 60}ms`,
                borderLeftColor: METER_COLORS[meter.slug] || '#EF4444',
                borderLeftWidth: '3px',
              }}
              aria-label={`Faire le ${meter.name}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{meter.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-[#FAFAFA] group-hover:text-white transition-colors leading-tight">
                    {meter.name}
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5 leading-snug line-clamp-1">
                    {meter.tagline}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-[#4B5563] font-medium bg-[#1A1A1A] px-2 py-0.5 rounded-full">{meter.questions.length}q</span>
                  <ArrowRight
                    size={16}
                    className="text-[#4B5563] group-hover:text-[#EF4444] transition-all group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Emergency banner */}
        <div className="mt-5 max-w-md mx-auto w-full">
          <div className="rounded-xl border border-[#EF4444]/15 bg-[#EF4444]/5 px-4 py-3">
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              🚨 <strong className="text-[#EF4444]">Urgence</strong> — Appelle le <strong className="text-[#FAFAFA]">17</strong> (police),
              le <strong className="text-[#FAFAFA]">112</strong> (urgences) ou
              le <strong className="text-[#FAFAFA]">3919</strong> (violences, 24h/24).
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-[#4B5563] text-center mt-4 max-w-sm mx-auto leading-relaxed">
          Ces outils ne remplacent pas un accompagnement professionnel.
          Aucune donnée n&apos;est collectée — tout reste sur ton appareil.
        </p>

        {/* SEO-rich footer section with internal links */}
        <section className="mt-6 max-w-md mx-auto w-full px-1">
          <p className="text-[11px] text-[#3D3D3D] leading-relaxed text-center">
            Ces outils d&apos;auto-évaluation sont proposés par <a href="/" className="text-[#555] underline underline-offset-2 hover:text-[#EF4444] transition-colors">Red or Green (Red Flag Games)</a>.
            Utilise-les pour évaluer ta situation et identifier d&apos;éventuels{' '}
            <a href="/redflag" className="text-[#555] underline underline-offset-2 hover:text-[#EF4444] transition-colors">red flags</a> dans tes relations.
            Tu peux aussi jouer au{' '}
            <a href="/jeu" className="text-[#555] underline underline-offset-2 hover:text-[#EF4444] transition-colors">jeu Red or Green</a> ou tester l&apos;
            <a href="/flagornot" className="text-[#555] underline underline-offset-2 hover:text-[#EF4444] transition-colors">Oracle</a> pour évaluer n&apos;importe quelle situation.
          </p>
        </section>
      </main>
    </div>
  );
}
