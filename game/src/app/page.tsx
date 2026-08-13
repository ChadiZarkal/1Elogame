'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Shield, Trophy, Flame, HelpCircle, Activity, Sparkles, MessageSquare, Info, X, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '@/lib/hooks';

type PersonaKey = 'redflag' | 'group' | 'doubt' | 'dixmais';

interface StatsData {
  totalVotes: number;
  estimatedPlayers: number;
}

const CARDS_DATA: Record<PersonaKey, {
  id: string;
  themeColor: string;
  glowColor: string;
  tag: string;
  title: string;
  tagline: string;
  desc: string;
  bullets: string[];
  cta: string;
  href: string;
  emoji: string;
  external?: boolean;
}> = {
  redflag: {
    id: 'redflagtest',
    themeColor: '#FFB4AA',
    glowColor: 'rgba(255, 180, 170, 0.4)',
    tag: '🧪 TEST PERSONNEL',
    title: 'REDFLAG TEST',
    tagline: 'Faire le point sur tes comportements.',
    desc: 'Tu réponds au quiz en solo, puis tu obtiens un score simple pour voir ce que les autres peuvent percevoir comme red flag chez toi.',
    bullets: ['🧠 En solo, en quelques minutes', '📊 Score clair à la fin', '🙈 Anonyme'],
    cta: 'FAIRE LE TEST',
    href: 'https://redflagtest.redorgreen.fr/',
    emoji: '🧪',
    external: true
  },
  group: {
    id: 'jeu',
    themeColor: '#2ECC71',
    glowColor: 'rgba(46, 204, 113, 0.4)',
    tag: '👥 JEU DE GROUPE',
    title: 'LE PIRE DES DEUX',
    tagline: 'Voter pour le plus red flag.',
    desc: 'Entre deux choix, votez pour celui qui est le plus red flag. Découvrez ensuite quel pourcentage de la communauté est d accord avec vous.',
    bullets: ['👥 Solo ou groupe', '🚩 Vote pour le pire des deux', '📊 Comparaison avec la communauté'],
    cta: 'LANCER LE DUEL',
    href: '/jeu',
    emoji: '🔥'
  },
  doubt: {
    id: 'oracle',
    themeColor: '#88CEFF',
    glowColor: 'rgba(136, 206, 255, 0.4)',
    tag: '🔮 AVIS RAPIDE IA',
    title: 'SOUMETS TON CAS',
    tagline: 'Obtenir un premier avis sur un doute.',
    desc: 'Tu décris une situation en texte libre et l Oracle renvoie un verdict red ou green avec justification. Utile pour prendre du recul vite.',
    bullets: ['✍️ Saisie libre', '🧠 Verdict + explication', '🗂 Historique communautaire (optionnel)'],
    cta: 'LANCER UNE ANALYSE',
    href: '/flagornot',
    emoji: '🔮'
  },
  dixmais: {
    id: 'dixmais',
    themeColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    tag: '⭐ JEU DE NOTATION',
    title: "C'est un 10 mais...",
    tagline: 'Combien vaut-il vraiment ?',
    desc: 'Il commence à 10. Puis les révélations s\'enchaînent. À chaque info, tu réévalues sa note. Jusqu\'où va-t-il chuter ?',
    bullets: ['⭐ 5 révélations par profil', '📉 La note se réévalue à chaque révélation', '🚫 Le 0 est éliminatoire — fin du profil'],
    cta: 'JOUER MAINTENANT',
    href: '/dixmais',
    emoji: '⭐'
  }
};

export default function HubPage() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [safeZoneOpen, setSafeZoneOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

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

  const gameCards = Object.values(CARDS_DATA);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050505] text-[#F5F5F5] selection:bg-[#FF3B30]/30 selection:text-white">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050505] bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="absolute left-1/2 top-[-7rem] h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF3B30]/18 blur-[120px]" />
        <div className="absolute bottom-0 left-[-4rem] h-64 w-64 rounded-full bg-[#10B981]/12 blur-[110px]" />
        <div className="absolute bottom-20 right-[-2rem] h-72 w-72 rounded-full bg-[#88CEFF]/12 blur-[110px]" />
      </div>

      <main id="main-content" className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-8 pt-6 sm:px-6">
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 w-full max-w-3xl">
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green Logo"
              width={540}
              height={118}
              priority
              draggable={false}
              className="mx-auto h-auto w-full max-w-[420px] object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)]"
            />
          </div>

          <h1 className="text-2xl font-black tracking-[-0.06em] text-white sm:text-4xl">Red or Green</h1>
          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#CFCFD4]/70">
            Le jeu qui divise
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#F5F5F5]/80 backdrop-blur-sm">
            <span className="text-[#FF3B30]">●</span>
            4 jeux disponibles • explore sans pression
          </div>
        </header>

        <button
          onClick={() => {
            handleTap();
            setHowToPlayOpen(true);
          }}
          className="fixed right-4 top-4 z-40 h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md transition-all hover:text-white active:scale-90"
          aria-label="Comment jouer ?"
        >
          <span className="sr-only">Comment jouer ?</span>
          <HelpCircle size={17} className="mx-auto" />
        </button>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-[#0D0D0F]/80 p-4 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Votes</p>
            <p className="mt-2 text-2xl font-black text-white">
              {stats ? Intl.NumberFormat('fr-FR').format(stats.totalVotes) : '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0D0D0F]/80 p-4 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Joueurs</p>
            <p className="mt-2 text-2xl font-black text-white">
              {stats ? Intl.NumberFormat('fr-FR').format(stats.estimatedPlayers) : '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0D0D0F]/80 p-4 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Découverte</p>
            <p className="mt-2 text-2xl font-black text-white">4 jeux</p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {gameCards.map((game, index) => {
            const isExternal = Boolean(game.external);
            const cardContent = (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em]"
                    style={{
                      color: game.themeColor,
                      borderColor: `${game.themeColor}55`,
                      backgroundColor: `${game.themeColor}12`
                    }}
                  >
                    {game.tag}
                  </span>
                  <span className="text-xl drop-shadow-[0_0_18px_rgba(255,255,255,0.2)]">{game.emoji}</span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">0{index + 1}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{game.id}</span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-white sm:text-[2rem]">
                  {game.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-white/75">{game.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#D1D1D6]">{game.desc}</p>

                <ul className="mt-4 space-y-2 text-sm text-[#F3F3F5]">
                  {game.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-0.5 text-base" style={{ color: game.themeColor }}>•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </>
            );

            const cardClassName = "group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-5 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.85)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)]";
            const actionLink = isExternal ? (
              <a
                href={game.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTap}
                aria-label={`${game.cta} : ${game.title}`}
                className="mt-6 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/6"
              >
                <span>{game.cta}</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </a>
            ) : (
              <Link
                href={game.href}
                onClick={handleTap}
                aria-label={`${game.cta} : ${game.title}`}
                className="mt-6 inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:border-white/20 hover:bg-white/6"
              >
                <span>{game.cta}</span>
                <ArrowRight size={12} strokeWidth={2.5} />
              </Link>
            );

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cardClassName}
                style={{
                  borderColor: `${game.themeColor}33`,
                  background: `linear-gradient(145deg, rgba(17,17,17,0.96), rgba(8,8,10,0.96))`,
                  boxShadow: `0 25px 50px -15px ${game.glowColor}`
                }}
              >
                <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at top right, ${game.glowColor}, transparent 50%)` }} />
                <div className="relative z-10 flex h-full flex-col">
                  {cardContent}
                  <div className="mt-6 flex items-center justify-between gap-3 pt-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Découvrir</span>
                    {actionLink}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/classement"
            onClick={handleTap}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#0D0D0F]/80 px-4 py-4 text-left transition hover:border-[#2ECC71]/40 hover:bg-[#0f140f]"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Leaderboard</p>
              <p className="mt-1 text-sm font-black text-white">Le palmarès général</p>
            </div>
            <span className="text-xl">🏆</span>
          </Link>

          <button
            onClick={() => {
              handleTap();
              setSafeZoneOpen(true);
            }}
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/8 bg-[#0D0D0F]/80 px-4 py-4 text-left transition hover:border-[#10B981]/40 hover:bg-[#0d1714]"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Sécurité</p>
              <p className="mt-1 text-sm font-black text-white">Espace safe zone</p>
            </div>
            <span className="text-xl">🛡</span>
          </button>
        </section>
      </main>

      <AnimatePresence>
        {safeZoneOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setSafeZoneOpen(false)}
              className="fixed inset-0 z-50 cursor-pointer bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-110 rounded-t-4xl border-t border-[#10B981]/20 bg-linear-to-b from-[#080d0a] to-[#040504] px-6 pt-5 pb-8 shadow-[0_-15px_50px_rgba(16,185,129,0.15)] max-h-[85vh] overflow-y-auto"
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/10" />

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#10B981]">
                  <Shield size={14} /> ESPACE DE SÉCURITÉ
                </div>
                <button
                  onClick={() => setSafeZoneOpen(false)}
                  className="cursor-pointer p-1 text-white/40 transition hover:text-white active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">Besoin d&apos;aide ou d&apos;éclaircissement ?</h3>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#A7C5B8]">
                Le respect n&apos;est pas négociable. Retrouve un espace centralisé avec des outils interactifs, des repères utiles et des ressources d&apos;accompagnement.
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/ressources"
                  onClick={() => { handleTap(); setSafeZoneOpen(false); }}
                  className="group flex items-center justify-between rounded-xl border border-[#10B981]/15 bg-[#12241C]/40 px-4 py-3.5 text-xs font-semibold text-[#D1FAE5] transition hover:border-[#10B981]/30 hover:bg-[#153427]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🧭</span>
                    <span className="font-bold">Violentomètre, interactif et autres tests</span>
                  </div>
                  <ArrowRight size={14} className="text-[#10B981] opacity-70 transition group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/guide"
                  onClick={() => { handleTap(); setSafeZoneOpen(false); }}
                  className="group flex items-center justify-between rounded-xl border border-[#10B981]/15 bg-[#12241C]/40 px-4 py-3.5 text-xs font-semibold text-[#D1FAE5] transition hover:border-[#10B981]/30 hover:bg-[#153427]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🏳️</span>
                    <span className="font-bold">Guide des flags : Green, Red, Black...</span>
                  </div>
                  <ArrowRight size={14} className="text-[#10B981] opacity-70 transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-6 border-t border-white/4 pt-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/50">100% Anonyme & Sécurisé</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {howToPlayOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setHowToPlayOpen(false)}
              className="fixed inset-0 z-50 cursor-pointer bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-110 rounded-t-4xl border-t border-[#88CEFF]/20 bg-linear-to-b from-[#080b0f] to-[#040405] px-6 pt-5 pb-8 shadow-[0_-15px_50px_rgba(136,206,255,0.15)] max-h-[85vh] overflow-y-auto"
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/10" />

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#88CEFF]">
                  <HelpCircle size={14} /> FONCTIONNEMENT DES JEUX
                </div>
                <button
                  onClick={() => setHowToPlayOpen(false)}
                  className="cursor-pointer p-1 text-white/40 transition hover:text-white active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">Prêt à révéler les vérités ?</h3>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#88CEFF]/70">
                La plateforme se joue 100% sans compte et sans pub. En un clin d’œil, choisis le jeu adapté à ton humeur :
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFB4AA]/10 text-sm text-[#FFB4AA]">🧪</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-white">Faire le point sur toi (Red Flag Test)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Un quiz solo pour identifier tes habitudes relationnelles. Tu repars avec un score clair et facile à lire.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF3B30]/10 text-sm text-[#FF3B30]">🚩</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-white">Tester les réactions à chaud (Flash Flag)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Un test chronométré de 10 questions. Utile pour voir des réponses spontanées, sans trop réfléchir.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2ECC71]/10 text-sm text-[#2ECC71]">🎮</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-white">Voter pour le plus red flag (Red or Green Duel)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Entre deux choix, votez pour le plus red flag. Comparez votre avis au pourcentage de la communauté.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#88CEFF]/10 text-sm text-[#88CEFF]">🔮</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-white">Obtenir un premier avis (Oracle IA)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Tu écris ton doute et l IA donne un verdict red ou green avec explication. Pratique pour prendre du recul.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/10 text-sm text-[#F59E0B]">⭐</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-wide text-white">Combien vaut-il vraiment ? (C&apos;est un 10 mais...)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Chaque profil commence à 10. Les révélations s&apos;enchaînent. Note après chaque info. Le 0 est éliminatoire.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setHowToPlayOpen(false)}
                className="mt-6 w-full rounded-xl bg-white px-3 py-3 text-xs font-black uppercase tracking-wider text-black transition active:scale-95"
              >
                C&apos;est parti !
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}