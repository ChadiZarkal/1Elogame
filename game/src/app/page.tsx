'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Shield, Sparkles, Trophy, Flame, HelpCircle, Activity, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '@/lib/hooks';

type PersonaKey = 'dating' | 'group' | 'doubt';

interface StatsData {
  totalVotes: number;
  estimatedPlayers: number;
}

const SITUATIONS: Record<PersonaKey, {
  emoji: string;
  label: string;
  situation: string;
  solutionQuote: string;
  gameId: string;
  ctaText: string;
  href: string;
}> = {
  dating: {
    emoji: '🥂',
    label: 'En Date / Rencontre',
    situation: "Avant d'aller prendre un verre ou de le/la voir...",
    solutionQuote: "Filtre ses limites et vérifie vos valeurs fondamentales en 2 minutes.",
    gameId: 'flashflag',
    ctaText: 'Lancer un Flash Flag',
    href: '/flashflag',
  },
  group: {
    emoji: '🔥',
    label: 'Entre amis / Soirée',
    situation: "Vous cherchez à relancer l'ambiance et animer le débat...",
    solutionQuote: "Votez sur les pires red flags et confrontez vos points de vue wtf !",
    gameId: 'jeu',
    ctaText: 'Lancer le Duel',
    href: '/jeu',
  },
  doubt: {
    emoji: '💬',
    label: 'Un doute / Situation chelou',
    situation: "Un SMS suspect, un comportement bizarre ?",
    solutionQuote: "Demande son avis cash à l'IA pour savoir si c'est un signal toxique.",
    gameId: 'oracle',
    ctaText: 'Demander à l\'Oracle',
    href: '/flagornot',
  },
};

const GAMES = [
  {
    id: 'jeu',
    title: 'Red or Green : Le Duel',
    subtitle: 'Débattre en soirée',
    tagline: 'Le choc des opinions 🚩',
    detail: 'Entre amis ou en solo, vote pour le pire red flag ou green flag parmi deux options extrêmes. L\'arme ultime pour lancer des débats enflammés !',
    href: '/jeu',
    accent: '#2ECC71',
    accentBg: 'rgba(46, 204, 113, 0.08)',
    badge: 'Party Game',
    badgeColor: 'text-[#2ECC71] bg-[#2ECC71]/10 border-[#2ECC71]/20',
  },
  {
    id: 'flashflag',
    title: 'Flash Flag Sprint',
    subtitle: 'Filtrer un date',
    tagline: 'Test de toxicité chronométré ⚡',
    detail: 'Crée un test personnalisé de 10 questions chronométrées, envoie-le à ton date, et reçois son rapport de toxicité immédiat. Pas de retour en arrière possible !',
    href: '/flashflag',
    accent: '#FF3B30',
    accentBg: 'rgba(255, 59, 48, 0.08)',
    badge: 'Chrono Actif',
    badgeColor: 'text-[#FF3B30] bg-[#FF3B30]/10 border-[#FF3B30]/20',
  },
  {
    id: 'oracle',
    title: 'L\'Oracle par IA',
    subtitle: 'Analyser son couple/SMS',
    tagline: 'L\'IA qui te juge sans filtre 🔮',
    detail: 'Un doute sur une relation, un comportement ou un SMS bizarre ? Décris l\'histoire ou dépose une capture d\'écran. L\'IA envoie son verdict en direct.',
    href: '/flagornot',
    accent: '#88CEFF',
    accentBg: 'rgba(136, 206, 255, 0.08)',
    badge: 'Oracle IA',
    badgeColor: 'text-[#88CEFF] bg-[#88CEFF]/10 border-[#88CEFF]/20',
  },
  {
    id: 'redflagtest',
    title: 'Red Flag Test',
    subtitle: 'Quiz de Personnalité',
    tagline: 'Es-tu un red flag ? 🧪',
    detail: 'Fais notre grand test de personnalité de référence de manière anonyme et obtiens ton diplôme de toxicité officiel à partager.',
    href: 'https://redflagtest.redorgreen.fr/',
    accent: '#FFB4AA',
    accentBg: 'rgba(255, 180, 170, 0.08)',
    badge: 'Autodiag',
    badgeColor: 'text-[#FFB4AA] bg-[#FFB4AA]/10 border-[#FFB4AA]/20',
    external: true,
  },
];

export default function HubPage() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeSituation, setActiveSituation] = useState<PersonaKey>('group');

  useEffect(() => {
    fetch('/api/stats/public')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {});
  }, []);

  const handleTap = useCallback(() => {
    tap();
  }, [tap]);

  const sit = SITUATIONS[activeSituation];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#070708] text-[#F3F4F6] selection:bg-[#FF3B30]/30 selection:text-white pb-24">
      {/* Background Visual Artifacts for Nightlife Vibe */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_15px,rgba(255,255,255,0.02)_15px,rgba(255,255,255,0.02)_16px)]" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#FF3B30]/10 blur-[120px]" />
        <div className="absolute top-96 right-1/4 h-80 w-80 rounded-full bg-[#2ECC71]/6 blur-[110px]" />
        <div className="absolute bottom-40 left-1/4 h-80 w-80 rounded-full bg-[#88CEFF]/5 blur-[100px]" />
      </div>

      <main id="main-content" className="relative z-10 mx-auto w-full max-w-120 px-4 py-5 space-y-5">
        {/* Sleek App Header with Dynamic Stats Indicator */}
        <header className="flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-1 mb-6">
            <span className="text-xs font-black tracking-[0.2em] text-[#C8C8C8]/60 uppercase">Party Game</span>
            {stats ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 border border-[#2ECC71]/20 px-3 py-1 text-[10px] text-[#2ECC71] shadow-[0_0_15px_rgba(46,204,113,0.1)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2ECC71]"></span>
                </span>
                <span className="font-extrabold tracking-wider">
                  {stats.estimatedPlayers.toLocaleString('fr-FR')} Joueurs • {stats.totalVotes.toLocaleString('fr-FR')} Votes
                </span>
              </div>
            ) : (
              <div className="h-5 w-24 animate-pulse rounded-full bg-white/5" />
            )}
          </div>

          <div className="relative w-full rounded-3xl border border-white/6 bg-linear-to-b from-[#111215] to-[#15171A] p-5 shadow-[0_25px_50px_rgba(0,0,0,0.65)] overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#FF3B30]/5 rounded-full blur-2xl pointer-events-none" />
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green — Le party game gratuit"
              width={300}
              height={65}
              priority
              draggable={false}
              className="mx-auto h-auto w-48 sm:w-56"
            />
            <div className="mt-4 text-center space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFB4AA]">Pas de chichis, joue direct</p>
              <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-white">
                Révèle les toxicités ordinaires
              </h1>
              <p className="text-xs text-[#E7BDB7]/85 max-w-[90%] mx-auto font-medium">
                Des party games percutants pour lever les doutes, débattre ou rigoler en un clic. Sans inscription et 100% anonyme.
              </p>
            </div>
            
            <div className="mt-5 grid grid-cols-2 gap-2 text-center text-[10px] font-black uppercase tracking-[0.08em] text-[#A6A6A6]">
              <div className="rounded-xl border border-white/4 bg-white/2 py-2">⚡ 100% Gratuit</div>
              <div className="rounded-xl border border-white/4 bg-white/2 py-2">📱 Zéro Téléchargement</div>
            </div>
          </div>
        </header>

        {/* COMPREHENSION SPRINT: Express Recommender (Les Contextes Mobiles) */}
        <section className="rounded-3xl border border-white/6 bg-[#111215]/95 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#FFB4AA]" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFB4AA]">Guide de Démarrage</p>
          </div>
          <h2 className="mt-1 text-base font-black text-white">Trouve ton mode idéal en 1 clic</h2>
          <p className="text-[11px] text-[#A6C0B7] mt-0.5">T&apos;es dans quelle situation actuellement ?</p>

          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {(Object.keys(SITUATIONS) as PersonaKey[]).map((key) => {
              const isActive = activeSituation === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveSituation(key);
                    tap();
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border py-2.5 px-1.5 transition text-center select-none cursor-pointer ${
                    isActive
                      ? 'border-[#FFB4AA] bg-[#221514] text-white shadow-[0_0_15px_rgba(255,180,170,0.1)]'
                      : 'border-white/4 bg-[#17181D]/60 text-[#9E9E9E] hover:border-white/20'
                  }`}
                >
                  <span className="text-lg mb-1">{SITUATIONS[key].emoji}</span>
                  <span className="text-[10px] font-bold leading-tight line-clamp-1">
                    {SITUATIONS[key].label.split(' / ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSituation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-4 rounded-2xl border border-white/5 bg-[#1A1C21]/60 p-4 relative overflow-hidden"
            >
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E9E9E]">SITUATION</span>
                <p className="text-xs font-semibold text-[#F3F4F6] mt-0.5">{sit.situation}</p>
                <div className="my-2 h-px bg-white/6" />
                <p className="text-xs text-[#CBCBCB]">💡 <span className="font-bold text-[#FFB4AA]">{sit.solutionQuote}</span></p>
                
                <Link
                  href={sit.href}
                  onClick={handleTap}
                  className="mt-4 flex items-center justify-between rounded-xl bg-[#FFB4AA] px-4 py-2.5 text-xs font-black text-black transition active:scale-[0.98] hover:bg-white"
                >
                  <span className="uppercase tracking-[0.06em]">{sit.ctaText}</span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* L'ARÈNE DES JEUX: Clean, Simple & Deep Explanations */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-[#A1A1AA]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#A1A1AA]">Tous nos modes de jeu ({GAMES.length})</h2>
            </div>
          </div>

          <div className="grid gap-3">
            {GAMES.map((game) => {
              const isRecommended = game.id === sit.gameId;
              const CardWrapper = game.external ? 'a' : Link;
              
              const linkProps = game.external ? {
                href: game.href,
                target: '_blank',
                rel: 'noopener noreferrer'
              } : {
                href: game.href
              };

              return (
                // @ts-expect-error - Next/Link properties vary dynamically
                <CardWrapper
                  key={game.id}
                  onClick={handleTap}
                  {...linkProps}
                  className={`group relative block rounded-2xl border p-4.5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all cursor-pointer ${
                    isRecommended
                      ? 'border-[#FFB4AA] bg-linear-to-br from-[#251716] to-[#121315]'
                      : 'border-white/5 bg-[#111215]/90 hover:border-white/15'
                  }`}
                >
                  {/* Subtle Accent Glow behind active or hovered card */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${game.accentBg} 0%, transparent 100%)` }}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${game.badgeColor}`}>
                          {game.badge}
                        </span>
                        {isRecommended && (
                          <span className="text-[9px] font-semibold text-[#FFB4AA] uppercase tracking-wider animate-pulse flex items-center gap-1">
                            ⭐️ Conseillé pour toi
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-black text-white group-hover:text-[#FFB4AA] transition-colors mt-1 flex items-center gap-1.5">
                        {game.title}
                        {game.external && <ExternalLink size={12} className="opacity-40" />}
                      </h3>
                      
                      <p className="text-[11px] font-bold" style={{ color: game.accent }}>
                        {game.tagline}
                      </p>
                      
                      <p className="text-[11px] text-[#C4C4C6] leading-relaxed pt-1 font-medium">
                        {game.detail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.06em]">
                    <span className="text-[#8E8E93] group-hover:text-white transition-colors">
                      {game.external ? 'Ouvrir en externe' : 'Jouer maintenant'}
                    </span>
                    <div className="p-1 px-3 rounded-full bg-white/5 border border-white/4 text-white flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                      <span>Go</span>
                      <ArrowRight size={10} strokeWidth={2.5} />
                    </div>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </section>

        {/* EXPLICIT COMMUNITY LEADERBOARD LINK: Men vs Women Ranking */}
        <Link
          href="/classement"
          onClick={handleTap}
          className="group relative block overflow-hidden rounded-3xl border border-white/6 bg-[#16171B]/95 p-4.5 shadow-[0_20px_40px_rgba(0,0,0,0.55)] transition-all hover:border-[#FFB4AA]/30"
          aria-label="Voir le palmarès des red flags les plus votés"
        >
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-[#FFB4AA]/5 via-[#FFB4AA]/30 to-[#FFB4AA]/5" />
          
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[#FFB4AA] uppercase tracking-[0.25em]">
                <Trophy size={11} className="text-[#FFB4AA]" /> RÉSULTATS DU DUEL
              </div>
              
              <h3 className="text-base font-black text-white group-hover:text-[#FFB4AA] transition-colors pt-1">
                Le Palmarès des Red Flags (Homme/Femme)
              </h3>
              
              <p className="text-[11px] text-[#CBCBCB] leading-relaxed font-medium">
                Découvre et compare les pires red flags votés par la communauté, segmentés par genre (hommes / femmes) et tranches d&apos;âge. Quel est le comportement le plus disqualifiant en France ?
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFB4AA]/10 text-[#FFB4AA] transition-transform group-hover:scale-110">
              <Trophy size={16} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/4 pt-3 text-[10px] font-black uppercase tracking-[0.06em]">
            <span className="text-[#8E8E93] group-hover:text-[#FFB4AA] transition-colors">
              Voir les top red flags les plus votés
            </span>
            <div className="flex items-center gap-1 text-[#FFB4AA] group-hover:translate-x-1 transition-transform">
              <span>Consulter</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </div>
          </div>
        </Link>

        {/* EMERALD GREEN REASSURING SAFE ZONE SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-linear-to-b from-[#0b1712] to-[#070a08] p-5 shadow-[0_15px_35px_rgba(16,185,129,0.06)]">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#10B981]/5 blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-1.5 text-[9px] font-black text-[#10B981] uppercase tracking-[0.25em]">
            <Shield size={12} className="text-[#10B981]" /> Espace Safe Zone
          </div>
          
          <h3 className="mt-2 text-base font-black text-white">Besoin de recul ou d&apos;aide ?</h3>
          <p className="mt-1 text-[11px] text-[#A7C5B8] leading-relaxed font-medium">
            Le respect n&apos;est pas une option. Un espace d&apos;auto-évaluation gratuit et sécurisé pour repérer les comportements toxiques dans le couple et les rencontres.
          </p>

          <div className="mt-4 space-y-2">
            <Link
              href="/ressources/violentometre"
              onClick={handleTap}
              className="group flex items-center justify-between rounded-xl bg-[#12241C]/60 border border-[#10B981]/15 px-3 py-2.5 text-xs font-semibold text-[#D1FAE5] transition hover:bg-[#153427] hover:border-[#10B981]/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-base select-none">📈</span>
                <span className="font-bold">Violentomètre digital interactif</span>
              </div>
              <ArrowRight size={13} className="text-[#10B981] opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            <Link
              href="/ressources/consentometre"
              onClick={handleTap}
              className="group flex items-center justify-between rounded-xl bg-[#12241C]/60 border border-[#10B981]/15 px-3 py-2.5 text-xs font-semibold text-[#D1FAE5] transition hover:bg-[#153427] hover:border-[#10B981]/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-base select-none">🤝</span>
                <span className="font-bold">Consentomètre interactif</span>
              </div>
              <ArrowRight size={13} className="text-[#10B981] opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/ressources"
              onClick={handleTap}
              className="group flex items-center justify-between rounded-xl bg-[#12241C]/60 border border-[#10B981]/15 px-3 py-2.5 text-xs font-semibold text-[#D1FAE5] transition hover:bg-[#153427] hover:border-[#10B981]/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-base select-none">📚</span>
                <span className="font-bold">Ressources, dossiers & numéros d&apos;urgence</span>
              </div>
              <ArrowRight size={13} className="text-[#10B981] opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Secondary Navigation & Disclaimer Footer */}
        <footer className="space-y-4 pt-4 pb-2 text-center relative z-10 select-none">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold text-[#8E8E93]">
            <Link href="/mentions-legales" onClick={handleTap} className="hover:text-white transition-colors">Mentions légales</Link>
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <Link href="/confidentialite" onClick={handleTap} className="hover:text-white transition-colors">Confidentialité</Link>
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <Link href="/cgu" onClick={handleTap} className="hover:text-white transition-colors">CGU</Link>
          </nav>
          
          <p className="text-[10px] text-[#8E8E93]/40 tracking-wider">
            Red or Green © 2026 • Fait pour repérer les drapeaux
          </p>
        </footer>
      </main>

      {/* ULTRA-MODERNE TACTILE STICKY BOTTOM BAR (Optimized for Mobile/one-handed) */}
      <nav className="fixed bottom-0 left-1/2 z-40 flex h-18 w-full max-w-120 -translate-x-1/2 items-center justify-around border-t border-white/6 bg-[#0A0B0C]/85 px-4 pb-safe backdrop-blur-2xl shadow-[0_-15px_30px_rgba(0,0,0,0.65)]">
        <Link
          href="/flashflag"
          onClick={handleTap}
          className="flex flex-col items-center justify-center py-2 text-[#C8C8C8] hover:text-[#FF3B30] active:scale-95 transition-all text-center select-none"
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px] font-black uppercase tracking-[0.04em] mt-0.5">Flash Flag</span>
        </Link>
        
        <Link
          href="/jeu"
          onClick={handleTap}
          className="relative flex h-13 w-13 -translate-y-3 items-center justify-center rounded-full bg-[#2ECC71] text-black shadow-[0_0_20px_rgba(46,204,113,0.45)] hover:scale-105 active:scale-95 transition-all select-none"
          aria-label="Lancer le jeu Red or Green"
        >
          <span className="text-xl">🎮</span>
        </Link>
        
        <Link
          href="/classement"
          onClick={handleTap}
          className="flex flex-col items-center justify-center py-2 text-[#C8C8C8] hover:text-[#FFB4AA] active:scale-95 transition-all text-center select-none"
        >
          <span className="text-lg">🏆</span>
          <span className="text-[10px] font-black uppercase tracking-[0.04em] mt-0.5">Le Top ROG</span>
        </Link>
      </nav>
    </div>
  );
}