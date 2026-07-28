'use client';

/**
 * @module dixmais/Intro
 * Écran d'accueil.
 *
 * Une liste de règles ne se lit pas en soirée. La règle centrale — les
 * révélations s'empilent et la note se réévalue sur l'ensemble — est donc
 * *montrée* : une démonstration de quatre secondes tourne en boucle, où le
 * joueur voit les phrases s'accumuler et la note descendre.
 *
 * Le bouton est hors du conteneur défilant : sur un iPhone SE avec les barres
 * de Safari, il tombait cent pixels sous la ligne de flottaison, sans barre de
 * défilement pour le signaler — le tout premier écran du jeu n'affichait pas
 * son unique bouton.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { scoreColor, withAlpha } from './scale';

/** Ouvre sur un red flag, comme le jeu : le serveur garantit que la première
 * révélation d'un profil est toujours négative. Le troisième temps montre
 * qu'une qualité peut aussi faire remonter la note. */
const DEMO = [
  { text: 'il est jaloux maladif', score: 6, connector: null, icon: '🚩' },
  { text: 'il parle de son ex non-stop', score: 3, connector: 'ET', icon: '🚩' },
  { text: 'il cuisine très bien', score: 5, connector: 'MAIS', icon: '🟢' },
] as const;

export function Intro({ onStart, failed }: { onStart: () => void; failed: boolean }) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
        <div className="flex min-h-full flex-col items-center justify-center py-3 text-center">
          <p
            className="mb-3 text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: 'rgba(245,158,11,0.6)' }}
          >
            Jeu de soirée
          </p>

          {/* Bornées en vh : sur un écran court, le titre cède la place au
              reste plutôt que de repousser tout le contenu vers le bas. */}
          <h1 className="mb-5">
            <span
              className="block font-black uppercase leading-none tracking-tight text-white"
              style={{ fontSize: 'min(3.2rem, 10vw, 5.5vh)' }}
            >
              C&apos;est un
            </span>
            <span
              className="block font-black leading-[0.82]"
              style={{
                fontSize: 'min(9rem, 26vw, 15vh)',
                letterSpacing: '-0.06em',
                color: '#FFD700',
                textShadow: '0 0 60px rgba(255,215,0,0.55), 0 0 120px rgba(245,158,11,0.28)',
              }}
            >
              10
            </span>
            <span
              className="block font-black uppercase leading-none tracking-tight text-white/90"
              style={{ fontSize: 'min(3.2rem, 10vw, 5.5vh)' }}
            >
              mais…
            </span>
          </h1>

          <MechanicDemo />

          <p className="mt-4 max-w-xs text-sm font-semibold leading-snug text-white/55">
            Les révélations <span className="text-white">s&apos;empilent</span>. À chaque fois, tu
            renotes la personne{' '}
            <span style={{ color: '#FBBF24' }}>en comptant tout ce que tu sais déjà</span>.
          </p>
          <p className="mt-1.5 text-xs font-bold text-white/35">
            Un 0 est éliminatoire : la partie s&apos;arrête là.
          </p>

          <Link
            href="/dixmais/leaderboard"
            className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-amber-300"
            style={{ color: 'rgba(245,158,11,0.45)' }}
          >
            <Trophy size={10} /> Classement des red flags
          </Link>
        </div>
      </div>

      <div
        className="shrink-0 px-6 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        {failed && (
          <p className="mb-2 text-center text-xs font-bold text-red-400">
            Connexion impossible. Réessaie.
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="w-full cursor-pointer rounded-2xl py-[18px] text-lg font-black uppercase tracking-widest text-black"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
            boxShadow: '0 8px 40px rgba(245,158,11,0.45)',
          }}
        >
          {failed ? 'Réessayer' : 'Jouer'}
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Boucle : une phrase s'ajoute, la note bouge. Se passe de commentaire. */
function MechanicDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (DEMO.length + 1)), 1500);
    return () => clearInterval(id);
  }, []);

  const shown = Math.min(step, DEMO.length - 1);
  const score = DEMO[shown].score;
  const tint = scoreColor(score);

  return (
    <div
      className="w-full max-w-xs rounded-2xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 text-left">
          {DEMO.map((item, i) => (
            <motion.div
              key={item.text}
              animate={{ opacity: i <= shown ? (i === shown ? 1 : 0.35) : 0.08 }}
              transition={{ duration: 0.35 }}
              className="py-[3px]"
            >
              {item.connector && (
                <span
                  className="mr-1.5 text-[9px] font-black uppercase tracking-[0.18em]"
                  style={{ color: '#F59E0B' }}
                >
                  {item.connector}
                </span>
              )}
              <span className="text-[12px] font-semibold leading-tight text-white">
                {item.icon} {item.text}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="shrink-0 text-right">
          <motion.p
            key={score}
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black leading-none tabular-nums"
            style={{ color: tint, textShadow: `0 0 24px ${withAlpha(tint, 0.5)}` }}
          >
            {score}
          </motion.p>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/25">sur 10</p>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${score * 10}%`, backgroundColor: tint }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
