'use client';

/**
 * @module dixmais/page
 * « C'est un 10 mais… » — assemblage des écrans.
 *
 * La logique de manche est dans `useDixMais`, l'échelle de notation dans
 * `scale`, les fins dans `endings`. Ce fichier ne fait que disposer les écrans
 * et le châssis commun.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Ambient } from './Ambient';
import { Intro } from './Intro';
import { ProfileCard } from './ProfileCard';
import { ScoreDial } from './ScoreDial';
import { Verdict } from './Verdict';
import { useDixMais } from './useDixMais';
import { scoreColor, withAlpha, START_SCORE } from './scale';

export default function DixMaisPage() {
  const game = useDixMais();
  const { phase, round } = game;

  // Le pied de page du site est un frère de cette page dans la mise en page
  // racine : le document reste donc défilant derrière le châssis `h-dvh`, et un
  // glissement vertical hors de la jauge faisait remonter l'en-tête et
  // apparaître les mentions légales en pleine partie. On neutralise le
  // défilement du document pendant la notation seulement — l'accueil et le
  // verdict gardent l'accès au pied de page.
  // Ce verrou visait `body`, où il n'avait aucun effet : `globals.css` pose
  // `overflow-x: clip` sur `html` ET `body`, ce qui empêche `body` de propager
  // son débordement au viewport. Le conteneur de défilement est donc
  // `documentElement`, et c'est lui qu'il faut verrouiller.
  // Le verrou est levé sur un écran trop court pour le châssis — en paysage,
  // typiquement — sans quoi le bas du jeu deviendrait inatteignable.
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (!window.matchMedia('(min-height: 500px)').matches) return;

    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
    };
  }, [phase]);

  // Le châssis ne fait qu'un écran, mais les notes éditoriales et le pied de
  // page sont rendus dessous : le document est défilable. Sans cette remise à
  // zéro, on passait à l'écran de verdict en gardant la position acquise
  // pendant la manche — le verdict était peint au-dessus de la ligne de
  // flottaison, et il fallait remonter pour le lire.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [phase]);

  return (
    <div className="relative flex h-[calc(100dvh-var(--header-h,3rem))] min-h-[500px] flex-col overflow-hidden text-white select-none">
      <Ambient score={game.ambientScore} shock={game.shock} />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-2">
        {/* Marges négatives : la cible passe à 44 px sans écarter la barre. */}
        <Link
          href="/"
          className="-m-2.5 flex h-11 items-center gap-1.5 px-2.5 text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft size={17} />
          <span className="text-[11px] font-black uppercase tracking-[0.22em]">Menu</span>
        </Link>

        {phase === 'reveal' && round && (
          <div className="flex items-center gap-1.5">
            {round.statements.map((s, i) => (
              <span
                key={s.id}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === round.index ? 18 : 6,
                  background:
                    i < round.index
                      ? withAlpha(scoreColor(round.ratings[i] ?? START_SCORE), 0.85)
                      : i === round.index
                        ? '#FFD700'
                        : 'rgba(255,255,255,0.14)',
                }}
              />
            ))}
          </div>
        )}

        {phase !== 'intro' ? (
          <button
            onClick={game.restart}
            aria-label="Recommencer"
            className="-m-2.5 flex h-11 w-11 cursor-pointer items-center justify-center text-white/25 transition-colors hover:text-white/50 active:scale-90"
          >
            <RotateCcw size={17} />
          </button>
        ) : (
          <span className="w-[17px]" />
        )}
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {(phase === 'intro' || phase === 'error') && (
            <Intro key="intro" onStart={game.start} failed={phase === 'error'} />
          )}

          {phase === 'loading' && <Loading key="loading" />}

          {phase === 'reveal' && round && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-3"
            >
              <ProfileCard
                identity={round.identity}
                statements={round.statements}
                ratings={round.ratings}
                index={round.index}
                draft={game.draft}
                flash={game.flash}
              />

              <div
                className="shrink-0"
                /* Le plancher passe de 4 à 12 px : la jauge est le contrôle le
                   plus bas de l'écran, et 4 px la collaient à la barre
                   gestuelle sur les téléphones sans encoche. */
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
              >
                {/* L'instruction porte tout le sens du jeu : elle est écrite en
                    clair, pas en légende grise de 10 px comme auparavant.
                    L'aide de premier lancement occupe cet emplacement plutôt
                    que d'en ajouter un — hauteur réservée pour deux lignes, la
                    jauge ne bouge donc jamais sous le pouce. */}
                <div className="mb-2 flex min-h-[34px] items-center justify-center">
                  <p className="text-center text-[13px] font-bold leading-tight text-white/75">
                    {game.showCoach && round.index === 0 ? (
                      <>
                        Glisse la jauge pour poser ta note —{' '}
                        <span style={{ color: '#FBBF24' }}>elle repartira de là</span> à la
                        révélation suivante.
                      </>
                    ) : round.index === 0 ? (
                      <>
                        Tu lui mets combien,{' '}
                        <span style={{ color: '#FBBF24' }}>maintenant que tu sais ça</span> ?
                      </>
                    ) : (
                      <>
                        Et maintenant, en comptant{' '}
                        <span style={{ color: '#FBBF24' }}>tout ce qui est écrit au-dessus</span> ?
                      </>
                    )}
                  </p>
                </div>

                <ScoreDial
                  value={game.draft}
                  previous={game.previousScore}
                  onChange={game.setDraft}
                  onCommit={game.commit}
                  disabled={game.locked}
                />
              </div>
            </motion.div>
          )}

          {phase === 'verdict' && round && (
            <Verdict
              key="verdict"
              identity={round.identity}
              statements={round.statements}
              ratings={round.ratings}
              profileNumber={game.profileNumber}
              onNext={game.nextProfile}
              loadFailed={game.loadFailed}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-4"
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="h-10 w-10 rounded-full border-[3px] border-transparent"
        style={{ borderTopColor: '#FFD700', borderRightColor: 'rgba(245,158,11,0.3)' }}
      />
      <p className="text-sm font-bold uppercase tracking-wider text-white/30">
        On te trouve quelqu&apos;un…
      </p>
    </motion.div>
  );
}
