'use client';

/**
 * @module dixmais/Intro
 * Écran d'accueil.
 *
 * Le titre, une démonstration, une phrase, un bouton. La règle — chaque info
 * se note seule, jusqu'à 15 pour une qualité, et la personne reçoit la
 * moyenne — est *montrée* plutôt qu'expliquée : une phrase apparaît, reçoit sa
 * note, puis les notes se fondent en une moyenne.
 *
 * Le bouton est hors du conteneur défilant : sur un iPhone SE avec les barres
 * de Safari, il tombait sous la ligne de flottaison sans rien pour le signaler.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { scoreColor } from './scale';
import { formatNote, moyenneDe } from './moyenne';
import { BoutonDiscret, BoutonPrincipal, TEINTES } from './ui';

/** Deux red flags, un green flag qui dépasse le 10, une moyenne. */
const DEMO = [
  { text: 'Il est jaloux maladif', score: 3, vert: false },
  { text: 'Il cuisine comme un chef', score: 14, vert: true },
  { text: 'Il parle de son ex non-stop', score: 7, vert: false },
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
          {/* Bornées en vh : sur un écran court, le titre cède la place. */}
          <h1>
            <span
              className="block font-black uppercase leading-none tracking-tight text-white"
              style={{ fontSize: 'min(3rem, 10vw, 5.5vh)' }}
            >
              C&apos;est un
            </span>
            <span
              className="block font-black leading-[0.82]"
              style={{
                fontSize: 'min(9rem, 26vw, 15vh)',
                letterSpacing: '-0.06em',
                color: TEINTES.or,
                textShadow: '0 0 60px rgba(255,215,0,0.35)',
              }}
            >
              10
            </span>
            <span
              className="block font-black uppercase leading-none tracking-tight text-white/90"
              style={{ fontSize: 'min(3rem, 10vw, 5.5vh)' }}
            >
              mais…
            </span>
          </h1>

          <Demonstration />

          <p className="mt-6 max-w-[28ch] text-[15px] leading-snug" style={{ color: TEINTES.secondaire }}>
            Cinq infos sur quelqu&apos;un, notées une par une de 0 à 15.{' '}
            <span className="text-white">Sa note, c&apos;est ta moyenne.</span>
          </p>
        </div>
      </div>

      <div className="shrink-0 px-6 pt-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
        {failed && (
          <p className="mb-2 text-center text-xs font-bold text-red-400">Connexion impossible. Réessaie.</p>
        )}
        <BoutonPrincipal onClick={onStart}>{failed ? 'Réessayer' : 'Jouer'}</BoutonPrincipal>
        <div className="mt-1 flex">
          <BoutonDiscret href="/dixmais/leaderboard">
            <Trophy size={14} /> Classement
          </BoutonDiscret>
          {/* L'écran de jeu occupe toute la hauteur : rien n'indique que des
              explications suivent. Ce lien ne coûte qu'une ligne. */}
          <BoutonDiscret href="#page-notes-title">Comment ça marche ↓</BoutonDiscret>
        </div>
      </div>
    </motion.div>
  );
}

/** Une phrase, sa note ; puis la moyenne. En boucle. */
function Demonstration() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (DEMO.length + 1)), 1600);
    return () => clearInterval(id);
  }, []);

  const finale = step === DEMO.length;
  const courant = finale ? null : DEMO[step];
  const affiche = finale ? DEMO_MOYENNE : (courant?.score ?? 10);

  return (
    <div className="mt-8 w-full max-w-[19rem]">
      <div className="flex min-h-[46px] items-center gap-4 text-left">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-w-0 flex-1"
        >
          {courant ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: courant.vert ? TEINTES.vert : TEINTES.ambre }}>
                {courant.vert ? 'Et en plus…' : 'Mais…'}
              </p>
              <p className="text-[15px] font-semibold leading-tight text-white">{courant.text}</p>
            </>
          ) : (
            <p className="text-[15px] font-semibold text-white">Sa note : la moyenne</p>
          )}
        </motion.div>
        <motion.span
          key={`n-${step}`}
          initial={{ scale: 0.7, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 text-[34px] font-black leading-none tabular-nums"
          style={{ color: scoreColor(affiche) }}
        >
          {formatNote(affiche)}
        </motion.span>
      </div>

      {/* Les traits se colorent un à un, comme la progression en partie. */}
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {DEMO.map((d, i) => (
          <span
            key={d.text}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: finale || i <= step ? scoreColor(d.score) : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
    </div>
  );
}
