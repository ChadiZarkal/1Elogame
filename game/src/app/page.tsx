'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Shield, Trophy, Flame, HelpCircle, Activity, Sparkles, MessageSquare, Info, X, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '@/lib/hooks';
import { AdBanner } from '@/components/ads/AdBanner';

type PersonaKey = 'redflag' | 'group' | 'dating' | 'doubt';

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
  shortcut: string;
  external?: boolean;
}> = {
  redflag: {
    id: 'redflagtest',
    themeColor: '#FFB4AA',
    glowColor: 'rgba(255, 180, 170, 0.4)',
    tag: '🧪 TEST PERSONNEL',
    title: 'RED FLAG TEST',
    tagline: 'Faire le point sur tes comportements.',
    desc: 'Tu réponds au quiz en solo, puis tu obtiens un score simple pour voir ce que les autres peuvent percevoir comme red flag chez toi.',
    bullets: ['🧠 En solo, en quelques minutes', '📊 Score clair à la fin', '🙈 Anonyme'],
    cta: 'FAIRE LE TEST',
    href: 'https://redflagtest.redorgreen.fr/',
    emoji: '🧪',
    shortcut: 'Test',
    external: true
  },
  group: {
    id: 'jeu',
    themeColor: '#2ECC71',
    glowColor: 'rgba(46, 204, 113, 0.4)',
    tag: '👥 JEU DE GROUPE',
    title: 'RED OR GREEN DUEL',
    tagline: 'Voter pour le plus red flag.',
    desc: 'Entre deux choix, votez pour celui qui est le plus red flag. Découvrez ensuite quel pourcentage de la communauté est d accord avec vous.',
    bullets: ['👥 Solo ou groupe', '🚩 Vote pour le pire des deux', '📊 Comparaison avec la communauté'],
    cta: 'LANCER LE DUEL',
    href: '/jeu',
    emoji: '🔥',
    shortcut: 'Duel'
  },
  dating: {
    id: 'flashflag',
    themeColor: '#FF3B30',
    glowColor: 'rgba(255, 59, 48, 0.4)',
    tag: '⚡ TEST CHRONOMÉTRÉ',
    title: 'FLASH FLAG SPRINT',
    tagline: 'Tester les réactions à chaud.',
    desc: 'Tu lances un test de 10 questions avec temps limité. C est pratique pour observer les réponses spontanées, en face à face ou à distance via lien.',
    bullets: ['⏱ Temps court par question', '🔗 Partage par lien ou téléphone', '📋 Résumé final des réponses'],
    cta: 'COMMENCER LE SPRINT',
    href: '/flashflag',
    emoji: '🥂',
    shortcut: 'Sprint'
  },
  doubt: {
    id: 'oracle',
    themeColor: '#88CEFF',
    glowColor: 'rgba(136, 206, 255, 0.4)',
    tag: '🔮 AVIS RAPIDE IA',
    title: 'ORACLE IA',
    tagline: 'Obtenir un premier avis sur un doute.',
    desc: 'Tu décris une situation en texte libre et l Oracle renvoie un verdict red ou green avec justification. Utile pour prendre du recul vite.',
    bullets: ['✍️ Saisie libre', '🧠 Verdict + explication', '🗂 Historique communautaire (optionnel)'],
    cta: 'LANCER UNE ANALYSE',
    href: '/flagornot',
    emoji: '🔮',
    shortcut: 'Oracle'
  }
};

export default function HubPage() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<PersonaKey>('group');
  const [safeZoneOpen, setSafeZoneOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [swipeHint, setSwipeHint] = useState(true);
  const touchStartXRef = useRef<number | null>(null);

  const vibeOrder = useMemo(() => Object.keys(CARDS_DATA) as PersonaKey[], []);

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

  const switchVibeByStep = useCallback((step: number) => {
    setSelectedVibe((prev) => {
      const currentIndex = vibeOrder.indexOf(prev);
      const nextIndex = (currentIndex + step + vibeOrder.length) % vibeOrder.length;
      return vibeOrder[nextIndex];
    });
    tap();
    setSwipeHint(false);
  }, [tap, vibeOrder]);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    // Swipe threshold to avoid accidental tab switches on scroll.
    if (Math.abs(deltaX) < 42) return;

    if (deltaX < 0) {
      switchVibeByStep(1);
    } else {
      switchVibeByStep(-1);
    }
  }, [switchVibeByStep]);

  const activeCard = CARDS_DATA[selectedVibe];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#000000] text-[#E2E2E2] selection:bg-[#FF3B30]/30 selection:text-white pb-32">
      {/* Dynamic Background Shader & Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Sleek matrix grid */}
        <div className="absolute inset-0 bg-[#000000] bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-size-[32px_32px] opacity-60" />
        
        {/* Fluid morphing vaporwave orbs with dynamic color changes */}
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-125 w-125 rounded-full blur-[160px] opacity-25 transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundColor: activeCard.themeColor,
            boxShadow: `0 0 120px ${activeCard.themeColor}` 
          }} 
        />
        
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#111] blur-[100px] opacity-40" />
        <div className="absolute bottom-40 -right-20 h-80 w-80 rounded-full bg-[#111] blur-[100px] opacity-40" />
      </div>

      {/* CSS-Only Marquee Ribbon for extreme organic Gen Z vibe */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-custom {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
      `}</style>
      
      {/* Infinite scrolling ticker behind the main card */}
      <div className="absolute top-[32%] w-full py-2 bg-white/2 border-y border-white/4 overflow-hidden pointer-events-none z-0 transform -rotate-2 select-none">
        <div className="animate-marquee-custom text-[10px] font-black tracking-[0.15em] uppercase text-white/15 gap-8">
          <span>🚩 Il ne sait pas séparer l&apos;œuvre de l&apos;artiste • 🟢 Elle donne toujours les bons conseils • 🚩 Il met du lait avant les céréales • 🟢 Elle parle à son psy • 🚩 Il couvre ses potes charos • 🟢 Elle s&apos;amuse en boîte sans lui  • </span>
          <span>🚩 Il ne sait pas séparer l&apos;œuvre de l&apos;artiste • 🟢 Elle donne toujours les bons conseils • 🚩 Il met du lait avant les céréales • 🟢 Elle parle à son psy • 🚩 Il couvre ses potes charos • 🟢 Elle s&apos;amuse en boîte sans lui  • </span>
        </div>
      </div>

      {/* Main Container constrained to ergonomic vertical phone viewport */}
      <main id="main-content" className="relative z-10 mx-auto w-full max-w-110 px-5 py-6 flex flex-col items-center justify-between min-h-dvh">
        
        {/* 1. Header (Minimalist & Branding Focus) */}
        <header className="w-full space-y-4 flex flex-col items-center pt-2">
          {/* Centered Brand Logo - enlarged and dominant */}
          <div className="py-2 scale-100 hover:scale-[1.01] active:scale-95 transition-transform duration-200">
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green Logo"
              width={540}
              height={118}
              priority
              draggable={false}
              className="h-auto w-[88vw] max-w-115 object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)]"
            />
          </div>

          <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#CFCFD4]/70">
            Swipe pour changer de jeu
          </p>
        </header>

        {/* Floating help button moved out of header for cleaner logo stage */}
        <button
          onClick={() => {
            handleTap();
            setHowToPlayOpen(true);
          }}
          className="fixed top-4 right-4 z-40 h-10 w-10 rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md hover:text-white active:scale-90 transition-all cursor-pointer"
          aria-label="Comment jouer ?"
        >
          <span className="sr-only">Comment jouer ?</span>
          <HelpCircle size={17} className="mx-auto" />
        </button>

        {/* 2. Vibe Selector Capsule (Sliding layout indicator for 4 Games) */}
        <div className="w-full bg-[#111112] border border-white/5 rounded-2xl p-1 mt-4 flex justify-between gap-1 relative shadow-2xl">
          {(Object.keys(CARDS_DATA) as PersonaKey[]).map((key) => {
            const isSelected = selectedVibe === key;
            const data = CARDS_DATA[key];
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedVibe(key);
                  handleTap();
                }}
                className={`relative z-10 grow py-3 px-1 text-xs font-black tracking-wide rounded-xl flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-all select-none cursor-pointer ${
                  isSelected ? 'text-black font-black' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeVibeBg"
                    className="absolute inset-0 rounded-xl z-[-1]"
                    style={{ backgroundColor: activeCard.themeColor }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="text-base leading-none">{data.emoji}</span>
                <span className="font-black uppercase text-[9px] tracking-wide leading-none">{data.shortcut}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Hero Holographic Game Card (The Focal Point with ultra-smooth morphs) */}
        <div className="w-full my-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedVibe}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              className="relative w-full rounded-4xl border bg-linear-to-b from-[#0F1012] to-[#040405] p-6.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden"
              style={{
                borderColor: `${activeCard.themeColor}22`,
                boxShadow: `0 25px 50px -12px ${activeCard.themeColor}0C`
              }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Backglow element on card */}
              <div 
                className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500" 
                style={{ backgroundColor: activeCard.themeColor }}
              />

              <div className="space-y-4">
                {/* Mode Tag */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/4"
                    style={{ color: activeCard.themeColor }}
                  >
                    {activeCard.tag}
                  </span>
                  
                  <span className="text-xl font-bold opacity-30 select-none">
                    {activeCard.emoji}
                  </span>
                </div>

                {/* Big aggressive headline */}
                <div className="space-y-1">
                  <h2 className="text-[26px] font-black leading-none tracking-[-0.04em] text-white">
                    {activeCard.title}
                  </h2>
                  <p className="text-xs font-semibold tracking-wide" style={{ color: activeCard.themeColor }}>
                    {activeCard.tagline}
                  </p>
                </div>

                {/* Game specific description */}
                <p className="text-[13px] leading-relaxed text-[#D0D0D6] font-semibold pt-1">
                  {activeCard.desc}
                </p>

                {/* Specs / Bullet points */}
                <ul className="space-y-2 pt-2">
                  {activeCard.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[12px] font-black text-[#F0F0F4]">
                      <span className="text-sm select-none" style={{ color: activeCard.themeColor }}>✔</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {swipeHint && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1 text-[10px] font-black tracking-wider uppercase text-[#C2C2C8]">
                    <span>⬅</span>
                    <span>Swipe</span>
                    <span>➡</span>
                  </div>
                )}
              </div>

              {/* Massive Tactile Pulse Action Button */}
              <div className="pt-6">
                {activeCard.external ? (
                  <a
                    href={activeCard.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTap}
                    className="relative group w-full py-4 px-6 rounded-2xl flex items-center justify-between font-black text-xs uppercase tracking-widest text-black transition-all active:scale-[0.97] shadow-xl hover:brightness-110"
                    style={{
                      backgroundColor: activeCard.themeColor,
                      boxShadow: `0 8px 30px ${activeCard.themeColor}3F`
                    }}
                  >
                    <span>{activeCard.cta}</span>
                    <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-lg">
                      <span className="font-extrabold text-[10px]">GO</span>
                      <ArrowRight size={12} strokeWidth={2.5} />
                    </div>
                  </a>
                ) : (
                  <Link
                    href={activeCard.href}
                    onClick={handleTap}
                    className="relative group w-full py-4 px-6 rounded-2xl flex items-center justify-between font-black text-xs uppercase tracking-widest text-black transition-all active:scale-[0.97] shadow-xl hover:brightness-110"
                    style={{
                      backgroundColor: activeCard.themeColor,
                      boxShadow: `0 8px 30px ${activeCard.themeColor}3F`
                    }}
                  >
                    <span>{activeCard.cta}</span>
                    <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-lg">
                      <span className="font-extrabold text-[10px]">GO</span>
                      <ArrowRight size={12} strokeWidth={2.5} />
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Secondary Tactile Row (Highly ergonomic 2-column layout) */}
        <section className="w-full flex items-center gap-3 mt-2">
          {/* Results / Leaderboard */}
          <Link
            href="/classement"
            onClick={handleTap}
            className="flex-1 py-4 px-4 rounded-2xl bg-[#0F1012] border border-white/5 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform"
          >
            <span className="text-xl">🏆</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#A6A6A6] group-hover:text-[#2ECC71] mt-1 transition-colors">
              LE PALMARÈS GÉNÉRAL
            </span>
          </Link>

          {/* Safe Zone Trigger */}
          <button
            onClick={() => {
              handleTap();
              setSafeZoneOpen(true);
            }}
            className="flex-1 py-4 px-4 rounded-2xl bg-[#0F1012] border border-white/5 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-xl">🛡</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#A6A6A6] group-hover:text-[#10B981] mt-1 transition-colors">
              ESPACE SAFE ZONE
            </span>
          </button>
        </section>

        {/* Quiet Legal Footer */}
        <footer className="w-full mt-6 text-center space-y-1.5 select-none">
          <div className="flex justify-center items-center gap-3 text-[10px] font-black text-[#5C5C5F] uppercase tracking-wider">
            <Link href="/mentions-legales" onClick={handleTap} className="hover:text-white transition-colors">Mentions</Link>
            <span>•</span>
            <Link href="/confidentialite" onClick={handleTap} className="hover:text-white transition-colors">Secret</Link>
            <span>•</span>
            <Link href="/cgu" onClick={handleTap} className="hover:text-white transition-colors">CGU</Link>
          </div>
          <p className="text-[9px] text-[#5C5C5F]/60">RED OR GREEN © 2026 • POUR REPÉRER LES TOXICITÉS ORDINAIRES</p>
        </footer>

      </main>

      {/* ================= MODALS & DRAWERS (Keeping main UI incredibly pristine) ================= */}
      
      {/* Drawer 1: Safe Zone (Emerald green glow bottom sheet) */}
      <AnimatePresence>
        {safeZoneOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setSafeZoneOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            {/* Slide-Up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-110 rounded-t-4xl border-t border-[#10B981]/20 bg-linear-to-b from-[#080d0a] to-[#040504] px-6 pt-5 pb-8 shadow-[0_-15px_50px_rgba(16,185,129,0.15)] max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#10B981] uppercase tracking-[0.2em]">
                  <Shield size={14} /> ESPACE DE SÉCURITÉ
                </div>
                <button 
                  onClick={() => setSafeZoneOpen(false)} 
                  className="p-1 text-white/40 hover:text-white active:scale-90 transition-transform cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">Besoin d&apos;aide ou d&apos;éclaircissement ?</h3>
              <p className="text-xs text-[#A7C5B8] leading-relaxed font-semibold mt-1">
                Le respect n&apos;est pas négociable. Retrouve un espace centralisé avec des outils interactifs, des repères utiles et des ressources d&apos;accompagnement.
              </p>

              <div className="mt-5 space-y-3">
                <Link
                  href="/ressources"
                  onClick={() => { handleTap(); setSafeZoneOpen(false); }}
                  className="group flex items-center justify-between rounded-xl bg-[#12241C]/40 border border-[#10B981]/15 px-4 py-3.5 text-xs font-semibold text-[#D1FAE5] transition hover:bg-[#153427] hover:border-[#10B981]/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🧭</span>
                    <span className="font-bold">Violentomètre, interactif et autres tests</span>
                  </div>
                  <ArrowRight size={14} className="text-[#10B981] opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/guide"
                  onClick={() => { handleTap(); setSafeZoneOpen(false); }}
                  className="group flex items-center justify-between rounded-xl bg-[#12241C]/40 border border-[#10B981]/15 px-4 py-3.5 text-xs font-semibold text-[#D1FAE5] transition hover:bg-[#153427] hover:border-[#10B981]/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">🏳️</span>
                    <span className="font-bold">Guide des flags : Green, Red, Black...</span>
                  </div>
                  <ArrowRight size={14} className="text-[#10B981] opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="mt-6 border-t border-white/4 pt-4 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/50">100% Anonyme & Sécurisé</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer 2: Comment jouer / Rules of the game (Violet glow bottom sheet) */}
      <AnimatePresence>
        {howToPlayOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              onClick={() => setHowToPlayOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            {/* Slide-Up Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-110 rounded-t-4xl border-t border-[#88CEFF]/20 bg-linear-to-b from-[#080b0f] to-[#040405] px-6 pt-5 pb-8 shadow-[0_-15px_50px_rgba(136,206,255,0.15)] max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#88CEFF] uppercase tracking-[0.2em]">
                  <HelpCircle size={14} /> FONCTIONNEMENT DES JEUX
                </div>
                <button 
                  onClick={() => setHowToPlayOpen(false)} 
                  className="p-1 text-white/40 hover:text-white active:scale-90 transition-transform cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">Prêt à révéler les vérités ?</h3>
              <p className="text-xs text-[#88CEFF]/70 leading-relaxed font-semibold mt-1">
                La plateforme se joue 100% sans compte et sans pub. En un clin d’œil, choisis le jeu adapté à ton humeur :
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFB4AA]/10 flex items-center justify-center text-[#FFB4AA] shrink-0 text-sm">🧪</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wide">Faire le point sur toi (Red Flag Test)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Un quiz solo pour identifier tes habitudes relationnelles. Tu repars avec un score clair et facile à lire.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] shrink-0 text-sm">🚩</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wide">Tester les réactions à chaud (Flash Flag)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Un test chronométré de 10 questions. Utile pour voir des réponses spontanées, sans trop réfléchir.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71] shrink-0 text-sm">🎮</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wide">Voter pour le plus red flag (Red or Green Duel)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Entre deux choix, votez pour le plus red flag. Comparez votre avis au pourcentage de la communauté.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#88CEFF]/10 flex items-center justify-center text-[#88CEFF] shrink-0 text-sm">🔮</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wide">Obtenir un premier avis (Oracle IA)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Tu écris ton doute et l IA donne un verdict red ou green avec explication. Pratique pour prendre du recul.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setHowToPlayOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-transform cursor-pointer"
              >
                C&apos;est parti !
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Google AdSense Banner - Bottom of page */}
      <div className="relative z-20 w-full mt-8 mb-4 px-4">
        <AdBanner 
          slot="3749254789" 
          format="responsive"
          className="w-full"
        />
      </div>

    </div>
  );
}