'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Shield, Sparkles, Trophy } from 'lucide-react';
import { useHaptics } from '@/lib/hooks';

type PersonaKey = 'dating' | 'group' | 'doubt';

const PERSONAS: Record<PersonaKey, {
  label: string;
  headline: string;
  description: string;
  recommendation: {
    href: string;
    title: string;
    context: string;
    cta: string;
    external?: boolean;
  };
}> = {
  dating: {
    label: 'Avant un date',
    headline: 'Tu veux filtrer vite avant de te voir ?',
    description: 'Lance un test chrono pour verifier valeurs, respect et compatibilite.',
    recommendation: {
      href: '/flashflag',
      title: 'Flash Flag',
      context: 'Quiz rapide a partager',
      cta: 'Lancer Flash Flag',
    },
  },
  group: {
    label: 'Entre potes',
    headline: 'Tu veux un jeu debat instantane ?',
    description: 'Red or Green est fait pour voter, comparer et relancer la discussion.',
    recommendation: {
      href: '/jeu',
      title: 'Red or Green',
      context: 'Le duel des red flags',
      cta: 'Jouer au duel',
    },
  },
  doubt: {
    label: 'Tu as un doute',
    headline: 'Tu veux un avis sur une situation ?',
    description: 'Oracle te donne un verdict red flag / green flag sur ton cas.',
    recommendation: {
      href: '/flagornot',
      title: 'Oracle',
      context: 'Analyse de situation par IA',
      cta: 'Consulter Oracle',
    },
  },
};

const GAMES = [
  {
    id: 'flashflag',
    title: 'Flash Flag',
    subtitle: 'Filtrer un date vite',
    detail: 'Quiz chrono sans retour arriere.',
    href: '/flashflag',
    accent: '#FF3B30',
    emoji: '⚡',
  },
  {
    id: 'jeu',
    title: 'Red or Green',
    subtitle: 'Debattre entre potes',
    detail: 'Vote pour le pire red flag.',
    href: '/jeu',
    accent: '#2ECC71',
    emoji: '🚩',
  },
  {
    id: 'oracle',
    title: 'Oracle',
    subtitle: 'Analyser une situation',
    detail: 'Verdict IA sur ton histoire.',
    href: '/flagornot',
    accent: '#88CEFF',
    emoji: '🔮',
  },
  {
    id: 'redflagtest',
    title: 'Red Flag Test',
    subtitle: 'Quiz perso externe',
    detail: 'Es-tu un red flag ?',
    href: 'https://redflagtest.redorgreen.fr/',
    accent: '#FFB4AA',
    emoji: '🧪',
    external: true,
  },
];

export default function HubPage() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<{ totalVotes: number; estimatedPlayers: number } | null>(null);
  const [activePersona, setActivePersona] = useState<PersonaKey>('dating');

  useEffect(() => {
    fetch('/api/stats/public')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const handleTap = useCallback(() => {
    tap();
  }, [tap]);

  const persona = PERSONAS[activePersona];

  const renderRecommendation = () => {
    if (persona.recommendation.external) {
      return (
        <a
          href={persona.recommendation.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTap}
          className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 transition hover:border-white/30"
        >
          <div>
            <p className="text-sm font-black">{persona.recommendation.title}</p>
            <p className="text-xs text-[#CBCBCB]">{persona.recommendation.context}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#FFB4AA]">
            {persona.recommendation.cta}
            <ExternalLink size={14} />
          </span>
        </a>
      );
    }

    return (
      <Link
        href={persona.recommendation.href}
        onClick={handleTap}
        className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 transition hover:border-white/30"
      >
        <div>
          <p className="text-sm font-black">{persona.recommendation.title}</p>
          <p className="text-xs text-[#CBCBCB]">{persona.recommendation.context}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-[#FFB4AA]">
          {persona.recommendation.cta}
          <ArrowRight size={14} />
        </span>
      </Link>
    );
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0B0B0C] text-[#F5F5F5]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_14px,rgba(255,255,255,0.5)_14px,rgba(255,255,255,0.5)_15px)] opacity-[0.04]" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF3B30]/16 blur-3xl" />
        <div className="absolute top-72 right-0 h-72 w-72 translate-x-1/4 rounded-full bg-[#2ECC71]/12 blur-3xl" />
      </div>

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-120 space-y-4 px-5 pb-28 pt-6">
        <header className="rounded-3xl border border-white/10 bg-[linear-gradient(140deg,#111214_0%,#16181B_65%,#2A1412_100%)] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
          <Image
            src="/logo-rog-new.svg"
            alt="Red or Green — Le party game gratuit"
            width={320}
            height={70}
            draggable={false}
            className="mx-auto h-auto w-55 sm:w-62.5"
          />

          <div className="mt-4 space-y-2 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FFB4AA]">Commence en 10 secondes</p>
            <h1 className="text-[30px] font-black leading-[0.95] tracking-[-0.04em] sm:text-[34px]">
              Comprends le jeu
              <br />
              en un coup d oeil
            </h1>
            <p className="text-sm text-[#E7BDB7]">Selectionne ta situation et va direct au bon mode.</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[#D7D7D7]">Sans inscription</div>
            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[#D7D7D7]">Mobile first</div>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#121315]/85 p-4 shadow-[0_16px_30px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#4AE183]">Choisis ton contexte</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(Object.keys(PERSONAS) as PersonaKey[]).map((key) => (
              <button
                key={key}
                className={`rounded-xl border px-3 py-2 text-left transition ${activePersona === key ? 'border-[#FFB4AA] bg-[#2A1412] text-white' : 'border-white/10 bg-[#1A1C20] text-[#D4D4D4] hover:border-white/25'}`}
                onClick={() => setActivePersona(key)}
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em]">{PERSONAS[key].label}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-[#191A1E] p-3">
            <p className="text-sm font-black">{persona.headline}</p>
            <p className="mt-1 text-xs text-[#C8C8C8]">{persona.description}</p>
            {renderRecommendation()}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#131417] p-4 shadow-[0_16px_30px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#A6A6A6]">Tous les jeux</p>
          <div className="mt-3 grid gap-2">
            {GAMES.map((game) => {
              const isRecommended = game.href === persona.recommendation.href;

              if (game.external) {
                return (
                  <a
                    key={game.id}
                    href={game.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTap}
                    className={`rounded-xl border p-3 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition ${isRecommended ? 'border-[#FFB4AA] bg-[#251716]' : 'border-white/10 bg-[#1A1C20] hover:border-white/25'}`}
                    aria-label={`Ouvrir ${game.title}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.08em]" style={{ color: game.accent }}>{game.subtitle}</p>
                        <h2 className="mt-1 text-base font-black">{game.emoji} {game.title}</h2>
                        <p className="mt-0.5 text-xs text-[#C8C8C8]">{game.detail}</p>
                      </div>
                      <ExternalLink size={15} className="mt-1 text-[#D8D8D8]" />
                    </div>
                  </a>
                );
              }

              return (
                <Link
                  key={game.id}
                  href={game.href}
                  onClick={handleTap}
                  className={`rounded-xl border p-3 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition ${isRecommended ? 'border-[#FFB4AA] bg-[#251716]' : 'border-white/10 bg-[#1A1C20] hover:border-white/25'}`}
                  aria-label={`Aller vers ${game.title}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em]" style={{ color: game.accent }}>{game.subtitle}</p>
                      <h2 className="mt-1 text-base font-black">{game.emoji} {game.title}</h2>
                      <p className="mt-0.5 text-xs text-[#C8C8C8]">{game.detail}</p>
                    </div>
                    <ArrowRight size={15} className="mt-1 text-[#D8D8D8]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <Link
          href="/classement"
          onClick={handleTap}
          className="block rounded-2xl border border-white/10 bg-[#16171A] p-4 shadow-[0_12px_26px_rgba(0,0,0,0.45)]"
          aria-label="Voir les top red flags pour hommes et femmes"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FFB4AA]">Top red flags</p>
              <h3 className="mt-1 text-lg font-black">Classement des red flags les plus votes</h3>
              <p className="mt-1 text-sm text-[#CBCBCB]">Vue hommes / femmes pour voir ce qui ressort le plus.</p>
            </div>
            <Trophy size={18} className="mt-1 text-[#FFB4AA]" />
          </div>
        </Link>

        <section className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#1B1B1D_0%,#141416_100%)] p-4 shadow-[0_16px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#4AE183]" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6BFE9C]">Safe Zone</p>
          </div>
          <p className="mt-2 text-sm text-[#D7D7D7]">Un espace séparé pour comprendre, se protéger et mieux décider.</p>

          <div className="mt-3 space-y-2">
            <Link
              href="/ressources/violentometre"
              onClick={handleTap}
              className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5 text-sm hover:bg-black/30"
            >
              <span>Violentometre</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/ressources/consentometre"
              onClick={handleTap}
              className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5 text-sm hover:bg-black/30"
            >
              <span>Consentometre</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/ressources"
              onClick={handleTap}
              className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2.5 text-sm hover:bg-black/30"
            >
              <span>Toutes les ressources</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <footer className="space-y-3 pb-2 text-center">
          <div className="min-h-5 text-xs text-[#8B8B8B]">
            {stats && (
              <p>
                <Sparkles size={12} className="mb-0.5 mr-1 inline" />
                {stats.estimatedPlayers.toLocaleString('fr-FR')} joueurs · {stats.totalVotes.toLocaleString('fr-FR')} votes
              </p>
            )}
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#9A9A9A]">
            <Link href="/mentions-legales" onClick={handleTap} className="hover:text-[#E2E2E2]">Mentions légales</Link>
            <Link href="/confidentialite" onClick={handleTap} className="hover:text-[#E2E2E2]">Confidentialité</Link>
            <Link href="/cgu" onClick={handleTap} className="hover:text-[#E2E2E2]">CGU</Link>
          </nav>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-120 -translate-x-1/2 items-center gap-2 border-t border-white/10 bg-[#101113]/90 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/flashflag"
          onClick={handleTap}
          className="flex-1 rounded-full border border-[#5D3F3B] bg-[#1B1718] px-4 py-2 text-center text-sm font-bold text-[#FFB4AA] transition hover:border-[#AD8883]"
        >
          Date Check
        </Link>
        <Link
          href="/jeu"
          onClick={handleTap}
          className="flex-1 rounded-full bg-[#2ECC71] px-4 py-2 text-center text-sm font-black text-[#003919] transition hover:bg-[#4AE183]"
        >
          Jouer
        </Link>
        <Link
          href="/classement"
          onClick={handleTap}
          className="flex-1 rounded-full border border-[#5D3F3B] bg-[#1B1718] px-4 py-2 text-center text-sm font-bold text-[#FFB4AA] transition hover:border-[#AD8883]"
        >
          Top Red Flags
        </Link>
      </nav>
    </div>
  );
}