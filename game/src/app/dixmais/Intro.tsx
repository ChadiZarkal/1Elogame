'use client';

/**
 * @module dixmais/Intro
 * Écran d'accueil.
 *
 * Une liste de règles ne se lit pas en soirée. La règle — chaque red flag se
 * note seul, et la personne reçoit la moyenne — est donc *montrée* : une
 * démonstration tourne en boucle, où chaque phrase reçoit sa note puis où les
 * notes se fondent en une moyenne.
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
import { formatNote, moyenneDe } from './moyenne';

/** Trois red flags, trois notes, une moyenne. */
const DEMO = [
  { text: 'Il est jaloux maladif', score: 2 },
  { text: 'Il parle de son ex non-stop', score: 5 },
  { text: 'Il ne fait jamais la vaisselle', score: 8 },
] as const;

const DEMO_MOYENNE = moyenneDe(DEMO.map((d) => d.score));

export function Intro({ onStart, failed }: { onStart: () => void; failed: boolean }) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
        <div className="flex min-h-full flex-col items-center justify-center py-3 text-center">
          <p
            className="mb-3 text-[11px] font-black uppercase tracking-[0.24em]"
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
            5 red flags, notés <span className="text-white">un par un</span>, de 0 à 10. Sa note
            finale, <span style={{ color: '#FBBF24' }}>c&apos;est ta moyenne</span>.
          </p>
          <p className="mt-1.5 text-xs font-bold text-white/35">
            Un 0 pèse lourd, mais ne met pas fin à la partie.
          </p>

          <Link
            href="/dixmais/leaderboard"
            className="mt-4 flex min-h-11 items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-amber-300"
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
        {/* Le bouton ne demande rien et ne se désactive pas : sexe et âge sont
            demandés *après* l'appui, sur leur propre écran. Placés ici, dans la
            zone défilante, il fallait faire défiler pour les trouver pendant
            que le bouton en réclamait la réponse. */}
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

        {/* L'écran de jeu occupe exactement la hauteur de la fenêtre : rien
            n'indiquait que des explications suivaient, et personne ne fait
            défiler une page qui semble finie. Ce rappel ne coûte qu'une ligne
            et ne s'affiche que sur l'accueil du jeu. */}
        <a
          href="#page-notes-title"
          className="mt-1 flex min-h-11 items-center justify-center text-center text-[11px] font-bold uppercase tracking-[0.18em] text-white/30 transition-colors hover:text-white/60"
        >
          Comment ça marche ↓
        </a>
      </div>
    </motion.div>
  );
}

/** Boucle : chaque phrase reçoit sa note, puis les notes deviennent une
 * moyenne. Se passe de commentaire. */
function MechanicDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (DEMO.length + 1)), 1500);
    return () => clearInterval(id);
  }, []);

  const finale = step === DEMO.length;
  const courant = finale ? null : DEMO[step];
  const affiche = finale ? DEMO_MOYENNE : (courant?.score ?? 10);
  const tint = scoreColor(affiche);

  return (
    <div
      className="w-full max-w-xs rounded-2xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex min-h-[52px] items-center gap-3">
        <div className="min-w-0 flex-1 text-left">
          {courant ? (
            <motion.div
              key={courant.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: '#F59E0B' }}>
                C&apos;est un 10, mais…
              </p>
              <p className="text-[13px] font-semibold leading-tight text-white">🚩 {courant.text}</p>
            </motion.div>
          ) : (
            <motion.p
              key="moyenne"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] font-black uppercase tracking-wide text-white"
            >
              Sa note : la moyenne
            </motion.p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <motion.p
            key={step}
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-black leading-none tabular-nums"
            style={{ color: tint, textShadow: `0 0 24px ${withAlpha(tint, 0.5)}` }}
          >
            {formatNote(affiche)}
          </motion.p>
          <p className="text-[11px] font-black uppercase tracking-wider text-white/40">
            {finale ? 'moyenne' : 'sur 10'}
          </p>
        </div>
      </div>

      {/* Les cases se remplissent une à une : on voit que chaque note compte
          pour elle-même avant de compter dans la moyenne. */}
      <div className="mt-2.5 flex gap-1.5">
        {DEMO.map((d, i) => {
          const visible = finale || i <= step;
          return (
            <motion.div
              key={d.text}
              animate={{ opacity: visible ? 1 : 0.25 }}
              className="flex h-6 flex-1 items-center justify-center rounded-md text-[11px] font-black tabular-nums"
              style={{
                background: visible ? withAlpha(scoreColor(d.score), 0.18) : 'rgba(255,255,255,0.05)',
                color: visible ? scoreColor(d.score) : 'transparent',
              }}
            >
              {d.score}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
