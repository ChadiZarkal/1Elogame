'use client';

/**
 * @module dixmais/page
 * « C'est un 10 mais… » — assemblage des écrans.
 *
 * La logique de manche est dans `useDixMais`, l'échelle de notation dans
 * `scale`, les fins dans `endings`. Ce fichier ne fait que disposer les écrans
 * et le châssis commun.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Ambient } from './Ambient';
import { Intro } from './Intro';
import { ProfileCard } from './ProfileCard';
import { ScoreDial } from './ScoreDial';
import { Verdict } from './Verdict';
import { ReportScreen } from './ReportScreen';
import { ProfileStep } from './ProfileStep';
import { useDixMais } from './useDixMais';
import { PausePub } from './PausePub';
import { pauseDixmaisDue } from '@/config/ads';
import { scoreColor } from './scale';

export default function DixMaisPage() {
  const game = useDixMais();
  const { phase, round } = game;
  /** Le profil qu'affiche le verdict : toujours le dernier jugé, versé dans
   * l'historique au moment même où la phase bascule. */
  const lastRound = game.history.at(-1) ?? null;

  /* La pause publicitaire, tous les cinq profils : elle s'intercale entre le
     verdict (ou le bilan) et le profil suivant. `pauseVue` retient après
     quel profil elle a déjà eu lieu, pour ne pas la montrer deux fois. */
  const [enPause, setEnPause] = useState(false);
  const pauseVue = useRef(0);
  const profilSuivant = () => {
    const n = game.history.length;
    if (pauseDixmaisDue(n) && pauseVue.current !== n) {
      pauseVue.current = n;
      setEnPause(true);
      return;
    }
    game.nextProfile();
  };
  const finirPause = () => {
    setEnPause(false);
    game.nextProfile();
  };
  // « Recommencer » remet l'historique à zéro : la pause repart du début, et
  // une pause ouverte au moment du clic ne doit pas resurgir au verdict suivant.
  const profilsJuges = game.history.length;
  useEffect(() => {
    if (profilsJuges === 0) pauseVue.current = 0;
  }, [profilsJuges]);
  useEffect(() => {
    if (phase !== 'verdict' && phase !== 'report') setEnPause(false);
  }, [phase]);

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

      {/* Une seule ligne : la progression en sept traits, et « recommencer ».
          Les traits prennent la couleur de la note donnée — c'est le seul
          rappel des notes passées pendant la partie. */}
      <header className="relative z-10 flex h-12 shrink-0 items-center gap-4 px-5 [@media(max-height:620px)]:h-10">
        <div className="flex flex-1 items-center gap-1.5" aria-hidden={phase !== 'reveal'}>
          {phase === 'reveal' && round && round.statements.map((s, i) => (
            <span
              key={s.id}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                background:
                  i < round.notes.length
                    ? scoreColor(round.notes[i])
                    : i === round.index
                      ? 'rgba(255,255,255,0.7)'
                      : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {phase !== 'intro' && (
          <button
            onClick={game.restart}
            aria-label="Recommencer"
            className="-m-2.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-white/30 transition-colors hover:text-white/60 active:scale-90"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {(phase === 'intro' || phase === 'error') && (
            <Intro key="intro" onStart={game.start} failed={phase === 'error'} />
          )}

          {/* Sexe et âge, une fois « Jouer » touché et seulement si on ne les
              connaît pas encore. Écran à part : dans la zone défilante de
              l'accueil, il fallait faire défiler pour les trouver. */}
          {phase === 'profile' && (
            <ProfileStep key="profile" onSubmit={game.submitProfile} />
          )}

          {phase === 'loading' && <Loading key="loading" />}

          {phase === 'reveal' && round && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col px-5"
            >
              <ProfileCard
                identity={round.identity}
                statements={round.statements}
                index={round.index}
                moyenne={game.runningAverage}
                flash={game.flash}
              />

              <div
                className="shrink-0"
                /* 12 px au moins : la jauge est le contrôle le plus bas de
                   l'écran, et collée à la barre gestuelle elle se rate. */
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
              >
                {/* La consigne ne s'affiche qu'à la toute première note : passé
                    ce cap, la phrase et la jauge se suffisent. */}
                {game.showCoach && round.index === 0 && (
                  <p className="mb-3 text-center text-[13px] font-medium leading-snug text-white/55">
                    Note chaque info seule, en partant de 10.
                    <br />
                    Une qualité peut <span className="text-emerald-400">dépasser 10</span>.
                  </p>
                )}

                <ScoreDial
                  value={game.draft}
                  onChange={game.setDraft}
                  onCommit={game.commit}
                  disabled={game.locked}
                />
              </div>
            </motion.div>
          )}

          {enPause && (phase === 'verdict' || phase === 'report') && (
            <PausePub key="pause-pub" profilsJuges={game.history.length} onContinuer={finirPause} />
          )}

          {!enPause && phase === 'verdict' && lastRound && (
            <Verdict
              key="verdict"
              profil={lastRound}
              sessionCount={game.history.length}
              onNext={profilSuivant}
              onReport={game.openReport}
              loadFailed={game.loadFailed}
            />
          )}

          {!enPause && phase === 'report' && game.history.length > 0 && (
            <ReportScreen
              key="report"
              rounds={game.history}
              profile={game.playerProfile}
              getSessionId={game.getSessionId}
              onBack={game.closeReport}
              onNext={profilSuivant}
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
