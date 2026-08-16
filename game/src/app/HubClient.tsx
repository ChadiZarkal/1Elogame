'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, HelpCircle, X } from 'lucide-react';
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
    desc: 'Entre deux choix, votez pour celui qui est le plus red flag. Découvrez ensuite quel pourcentage de la communauté est d\'accord avec vous.',
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
    desc: 'Tu décris une situation en texte libre et l\'Oracle renvoie un verdict red ou green avec justification. Utile pour prendre du recul vite.',
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

export function HubClient() {
  const { tap } = useHaptics();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [selectedVibe, setSelectedVibe] = useState<PersonaKey>('redflag');
  const [safeZoneOpen, setSafeZoneOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
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
    <div className="relative min-h-[calc(100dvh-var(--header-h))] overflow-hidden bg-[#000000] text-[#E2E2E2] selection:bg-[#FF3B30]/30 selection:text-white pb-8">
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
      {/* `[@media(max-height:720px)]` — sur un 360x640, très répandu, le bouton
          qui lance le jeu tombait entièrement sous la ligne de flottaison : il
          fallait faire défiler pour jouer. Les écrans hauts gardent l'aération
          d'origine, les écrans courts se resserrent. */}
      <main id="main-content" className="relative z-10 mx-auto w-full max-w-110 px-5 py-6 [@media(max-height:720px)]:py-3 flex flex-col items-center justify-between min-h-[calc(100dvh-var(--header-h))]">
        
        {/* 1. Header (Minimalist & Branding Focus) */}
        <header className="w-full space-y-4 [@media(max-height:720px)]:space-y-1.5 flex flex-col items-center pt-2 [@media(max-height:720px)]:pt-0">
          {/* Centered Brand Logo - enlarged and dominant.
              Porté par le h1 : la page n'avait aucun titre de niveau 1, le
              logo n'étant qu'une image. Le nom accessible du titre vient de
              l'attribut alt — rien n'est ajouté de masqué. */}
          <h1 className="py-2 [@media(max-height:720px)]:py-0 scale-100 hover:scale-[1.01] active:scale-95 transition-transform duration-200">
            <Image
              src="/logo-rog-new.svg"
              alt="Red or Green — repérer les toxicités ordinaires"
              width={540}
              height={118}
              priority
              draggable={false}
              className="h-auto w-[88vw] [@media(max-height:720px)]:w-[62vw] max-w-115 object-contain drop-shadow-[0_0_28px_rgba(255,59,48,0.3)]"
            />
          </h1>

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
          /* `absolute` : ce bouton appartient au hub, pas à la fenêtre. En
             `fixed` il suivait le lecteur jusque dans le contenu éditorial. */
          className="absolute top-4 right-4 z-40 h-10 w-10 rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md hover:text-white active:scale-90 transition-all cursor-pointer"
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
                className={`relative z-10 grow py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all select-none cursor-pointer ${
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
                {/* Titre complet (pas le raccourci) : 4 titres désormais plus
                    longs partagent une rangée étroite, d'où une taille réduite,
                    un retour à la ligne autorisé et un tracking resserré. */}
                <span className="font-black uppercase text-[7.5px] tracking-tight leading-[1.1] text-center">
                  {data.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Hero Holographic Game Card (The Focal Point with ultra-smooth morphs) */}
        <div className="w-full my-6 [@media(max-height:720px)]:my-3 flex-1 flex flex-col justify-center">
          {/* `initial={false}` : la carte est l'élément LCP de la page. Sans
              cela elle est rendue à opacity 0 et n'apparaît qu'après
              l'hydratation, ce qui repousse le LCP de plusieurs secondes sur
              connexion lente. Le morph entre jeux, lui, reste animé. */}
          <AnimatePresence mode="wait" initial={false}>
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
                  {/* clamp() plutôt qu'une taille fixe : les nouveaux titres
                      ("LE PIRE DES DEUX", "SOUMETS TON CAS") sont plus longs
                      que l'ancien plus court ("ORACLE IA") et débordaient sur
                      petit écran à 26px fixe. leading-[1.05] laisse la place
                      à un retour à la ligne sans rogner les lettres. */}
                  <h2
                    className="font-black leading-[1.05] tracking-[-0.03em] text-white"
                    style={{ fontSize: 'clamp(1.35rem, 6.8vw, 1.625rem)' }}
                  >
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

        {/* 4. Rangée secondaire — grille 2×2.
            Le guide des flags et les outils d'auto-évaluation n'étaient
            joignables que par le pied de page, sous une page qui tient en un
            écran : personne n'y descendait. Ce sont pourtant les deux contenus
            les plus utiles du site. Une grille plutôt que deux cartes
            empilées : la hauteur du hub doit rester celle d'un écran. */}
        <section className="w-full grid grid-cols-2 gap-2.5 mt-2">
          <Link
            href="/classement"
            onClick={handleTap}
            className="py-3 px-3 rounded-2xl bg-[#0F1012] border border-white/5 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform"
          >
            <span className="text-lg leading-none">🏆</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#A6A6A6] group-hover:text-[#2ECC71] mt-1.5 transition-colors">
              LE PALMARÈS
            </span>
          </Link>

          <Link
            href="/guide"
            onClick={handleTap}
            className="py-3 px-3 rounded-2xl bg-[#2ECC71]/8 border border-[#2ECC71]/25 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform"
          >
            <span className="text-lg leading-none">🚩</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#2ECC71] mt-1.5">
              GUIDE DES FLAGS
            </span>
          </Link>

          <Link
            href="/ressources"
            onClick={handleTap}
            className="py-3 px-3 rounded-2xl bg-[#0F1012] border border-white/5 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform"
          >
            <span className="text-lg leading-none">🧭</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#A6A6A6] group-hover:text-[#8B5CF6] mt-1.5 transition-colors">
              TESTS SÉRIEUX
            </span>
          </Link>

          {/* Safe Zone Trigger */}
          <button
            onClick={() => {
              handleTap();
              setSafeZoneOpen(true);
            }}
            className="py-3 px-3 rounded-2xl bg-[#0F1012] border border-white/5 flex flex-col items-center justify-center text-center group active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-lg leading-none">🛡</span>
            <span className="font-black text-[9px] uppercase tracking-wider text-[#A6A6A6] group-hover:text-[#10B981] mt-1.5 transition-colors">
              SAFE ZONE
            </span>
          </button>
        </section>

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

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0 text-sm">⭐</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white uppercase tracking-wide">Combien vaut-il vraiment ? (C&apos;est un 10 mais...)</p>
                    <p className="text-[11px] text-[#A6A6A6]">Chaque profil commence à 10. Les révélations s&apos;enchaînent. Note après chaque info. Le 0 est éliminatoire.</p>
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

    </div>
  );
}