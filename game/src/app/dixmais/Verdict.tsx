'use client';

/**
 * @module dixmais/Verdict
 * Fin d'un profil : les sept notes deviennent une seule.
 *
 * En haut, ce qu'on vient chercher : la personne, ses sept notes qui se
 * fondent en une moyenne, et la fin qui la nomme. Dessous, sans cadres, le
 * détail note par note. Un seul bouton doré ; le reste en actions discrètes.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Share2, Check, BarChart3 } from 'lucide-react';
import { START_SCORE, scoreColor, scoreInk, scoreLabel, withAlpha } from './scale';
import { formatNote, poidsDansLaMoyenne, type ProfilJuge } from './moyenne';
import { BoutonDiscret, BoutonPrincipal, Pastille, Pied, Section, TEINTES } from './ui';

const SHARE_URL = 'https://redorgreen.fr/dixmais';

/** Délai avant que la moyenne n'apparaisse : le temps de voir les sept notes. */
const DELAI_MOYENNE = 0.75;

interface Props {
  profil: ProfilJuge;
  /** Nombre de profils jugés dans la session. */
  sessionCount: number;
  onNext: () => void;
  onReport: () => void;
  /** Le chargement du profil suivant a échoué : on reste ici. */
  loadFailed: boolean;
}

function points(n: number): string {
  return `${formatNote(n)} point${n >= 2 ? 's' : ''}`;
}

export function Verdict({ profil, sessionCount, onNext, onReport, loadFailed }: Props) {
  const [copied, setCopied] = useState(false);
  const { notes, propositions, communaute, moyenne, moyenneCommunaute, fin } = profil;
  const tint = scoreColor(moyenne);
  // Ce qui a le plus coûté à la moyenne, et ce qui lui a le plus rapporté :
  // signalés dans le détail. Le second n'existe que si une note dépasse 10.
  const plusLourd = notes.reduce((best, n, i) => (n < notes[best] ? i : best), 0);
  const poids = poidsDansLaMoyenne(notes, plusLourd);
  const plusPorteur = notes.reduce((best, n, i) => (n > notes[best] ? i : best), 0);
  const apport = notes[plusPorteur] > START_SCORE ? -poidsDansLaMoyenne(notes, plusPorteur) : 0;

  useEffect(() => {
    if (fin.tone !== 'triumphant') return;
    let cancelled = false;
    const id = setTimeout(() => {
      import('canvas-confetti')
        .then(({ default: confetti }) => {
          if (cancelled) return;
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#FFD700', '#4ADE80', '#FFFFFF'],
            disableForReducedMotion: true,
          });
        })
        .catch(() => {});
    }, DELAI_MOYENNE * 1000);
    return () => { cancelled = true; clearTimeout(id); };
  }, [fin.tone]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const share = async () => {
    const text = `${profil.nom}, ${profil.age} : ${profil.notes.length} révélations, ${formatNote(moyenne)}/10 de moyenne — « ${fin.title} ». Et toi, tu lui mets combien ?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "C'est un 10 mais…", text, url: SHARE_URL });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
      setCopied(true);
    } catch {
      /* partage annulé ou presse-papiers indisponible */
    }
  };

  const ecart = moyenneCommunaute === null ? 0 : moyenne - moyenneCommunaute;

  return (
    <motion.div
      key="verdict"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto overscroll-contain px-5"
    >
      {/* ── La note ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-black text-white"
            style={{
              background: `linear-gradient(145deg, hsl(${profil.teinte} 55% 46%), hsl(${profil.teinte + 26} 50% 30%))`,
            }}
          >
            {profil.initiale}
          </span>
          <span className="text-[15px] font-bold" style={{ color: TEINTES.texte }}>
            {profil.nom}, {profil.age}
          </span>
        </div>

        {/* Les sept notes, puis leur moyenne : la règle du jeu, montrée. */}
        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          {notes.map((n, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Pastille note={n} couleur={scoreInk(n)} taille="sm" />
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={
            fin.tone === 'brutal'
              ? { opacity: 1, scale: 1, x: [0, -6, 5, -3, 0] }
              : { opacity: 1, scale: 1 }
          }
          // La secousse d'une fin brutale a ses cinq étapes : un ressort n'en
          // accepte que deux, et Motion lève une erreur qui vide l'écran. Elle
          // a donc sa propre transition, en courbe simple.
          transition={{
            default: { type: 'spring', stiffness: 240, damping: 18, delay: DELAI_MOYENNE },
            x: { type: 'tween', duration: 0.4, ease: 'easeInOut', delay: DELAI_MOYENNE + 0.15 },
          }}
          className="mt-2 flex items-baseline"
          aria-label={`Moyenne ${formatNote(moyenne)} sur 10`}
        >
          <span
            className="font-black leading-none tabular-nums"
            style={{ fontSize: 'clamp(4.5rem, 24vw, 7rem)', color: tint, letterSpacing: '-0.05em' }}
          >
            {formatNote(moyenne)}
          </span>
          <span className="ml-1 text-xl font-bold" style={{ color: TEINTES.discret }}>/10</span>
        </motion.div>
        <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: withAlpha(tint, 0.8) }}>
          {scoreLabel(moyenne)}
        </p>

        {/* ── La fin ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: DELAI_MOYENNE + 0.2 }}
          className="mt-6 max-w-[32ch]"
        >
          <p className="text-[clamp(1.35rem,6.5vw,1.75rem)] font-black uppercase leading-tight text-white">
            {fin.title}
          </p>
          <p className="mt-2 text-[14px] leading-snug" style={{ color: TEINTES.secondaire }}>
            {fin.subtitle}
          </p>
        </motion.div>

        {moyenneCommunaute !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: DELAI_MOYENNE + 0.35 }}
            className="mt-4 text-[13px]"
            style={{ color: TEINTES.secondaire }}
          >
            Les autres lui mettent{' '}
            <span className="font-black tabular-nums" style={{ color: scoreColor(moyenneCommunaute) }}>
              {formatNote(moyenneCommunaute)}
            </span>
            {' · '}
            {Math.abs(ecart) < 0.5
              ? 'comme toi.'
              : ecart < 0
                ? `tu es ${points(-ecart)} plus dur que les autres avec ${profil.nom}.`
                : `tu es ${points(ecart)} plus indulgent que les autres avec ${profil.nom}.`}
          </motion.p>
        )}
      </div>

      {/* ── Le détail ───────────────────────────────────────────────────── */}
      <div className="mt-7">
        <Section titre={`Tes ${profil.notes.length} notes`}>
          <ul>
            {propositions.map((p, i) => {
              const autres = communaute[i];
              const coute = i === plusLourd && poids >= 0.5;
              const rapporte = i === plusPorteur && apport >= 0.5;
              return (
                <li key={p.id} className="flex items-start gap-3 py-2.5">
                  <span className="mt-0.5 shrink-0 text-[13px]" aria-hidden>
                    {p.type === 'positive' ? '🟢' : '🚩'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold leading-snug" style={{ color: TEINTES.texte }}>
                      {p.text}
                    </p>
                    {(autres !== null || coute || rapporte) && (
                      <p className="mt-0.5 text-[12px]" style={{ color: TEINTES.discret }}>
                        {[
                          autres !== null && `Les autres : ${formatNote(autres)}`,
                          rapporte && `lui rapporte ${points(apport)} de moyenne`,
                          coute && `lui coûte ${points(poids)} de moyenne`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <Pastille note={notes[i]} couleur={scoreInk(notes[i])} />
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      {/* ── Suite ───────────────────────────────────────────────────────── */}
      <Pied>
        {loadFailed && (
          <p className="pb-2 text-center text-xs font-bold text-red-400">
            Impossible de charger le profil suivant. Réessaie.
          </p>
        )}
        <BoutonPrincipal onClick={onNext}>Profil suivant →</BoutonPrincipal>
        <div className="flex">
          {/* Le bilan n'apparaît qu'à partir du deuxième profil : sur un seul,
              il ne dirait rien de plus que cet écran. */}
          {sessionCount >= 2 && (
            <BoutonDiscret onClick={onReport}>
              <BarChart3 size={15} /> Mon bilan · {sessionCount} profils
            </BoutonDiscret>
          )}
          <BoutonDiscret onClick={share}>
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'Copié' : 'Partager'}
          </BoutonDiscret>
          {/* À côté du bilan, le classement se réduit à son icône : trois
              libellés ne tiennent pas sur 320 px. */}
          <BoutonDiscret href="/dixmais/leaderboard">
            <Trophy size={15} />
            <span className={sessionCount >= 2 ? 'sr-only' : ''}>Classement</span>
          </BoutonDiscret>
        </div>
      </Pied>
    </motion.div>
  );
}
