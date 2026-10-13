'use client';

/**
 * @module dixmais/Verdict
 * Fin d'un profil : les cinq notes deviennent une seule.
 *
 * L'écran raconte le calcul plutôt que d'en donner le résultat : les cinq
 * notes apparaissent l'une après l'autre, puis se fondent en une moyenne qui
 * vient se poser sur la personne. C'est la règle du jeu, montrée.
 *
 * Viennent ensuite la fin retenue, ce que les autres joueurs lui auraient mis,
 * et le détail red flag par red flag.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Share2, Check, BarChart3 } from 'lucide-react';
import { scoreColor, scoreLabel, withAlpha } from './scale';
import { formatNote, poidsDansLaMoyenne, type ProfilJuge } from './moyenne';

const SHARE_URL = 'https://redorgreen.fr/dixmais';

/** Délai avant que la moyenne n'apparaisse : le temps de voir les cinq notes. */
const DELAI_MOYENNE = 0.95;

interface Props {
  profil: ProfilJuge;
  /** Nombre de profils jugés dans la session. */
  sessionCount: number;
  onNext: () => void;
  onReport: () => void;
  /** Le chargement du profil suivant a échoué : on reste ici. */
  loadFailed: boolean;
}

export function Verdict({ profil, sessionCount, onNext, onReport, loadFailed }: Props) {
  const [copied, setCopied] = useState(false);
  const { notes, propositions, communaute, moyenne, moyenneCommunaute, fin } = profil;
  const tint = scoreColor(moyenne);
  // Le red flag qui a le plus coûté à la moyenne, pour le signaler dans le détail.
  const plusLourd = notes.reduce((best, n, i) => (n < notes[best] ? i : best), 0);
  const poids = poidsDansLaMoyenne(notes, plusLourd);

  useEffect(() => {
    if (fin.tone !== 'triumphant') return;
    let cancelled = false;
    const id = setTimeout(() => {
      import('canvas-confetti')
        .then(({ default: confetti }) => {
          if (cancelled) return;
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.35 },
            colors: ['#FFD700', '#F59E0B', '#22C55E'],
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
    const text = `${profil.nom}, ${profil.age} : 5 red flags, ${formatNote(moyenne)}/10 de moyenne — « ${fin.title} ». Et toi, tu lui mets combien ?`;
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

  return (
    <motion.div
      key="verdict"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto overscroll-contain px-5"
    >
      <p className="pt-1 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
        Profil #{profil.numero}
      </p>

      {/* ── Le calcul : cinq notes, une moyenne ──────────────────────────── */}
      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
        {notes.map((n, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -10, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0.55], y: [-10, 0, 0, 6], scale: [0.6, 1, 1, 0.92] }}
            transition={{ duration: DELAI_MOYENNE + 0.5, times: [0, 0.2, 0.7, 1], delay: i * 0.1 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[15px] font-black tabular-nums"
            style={{
              background: withAlpha(scoreColor(n), 0.16),
              border: `1.5px solid ${withAlpha(scoreColor(n), 0.55)}`,
              color: scoreColor(n),
            }}
          >
            {n}
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-1.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/35"
        aria-hidden
      >
        ↓ moyenne des 5 ↓
      </motion.p>

      {/* ── La note, posée sur la personne ───────────────────────────────── */}
      <motion.div
        className="mt-2 flex items-center justify-center gap-4"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          fin.tone === 'brutal'
            ? { opacity: 1, scale: 1, x: [0, -7, 6, -4, 0] }
            : { opacity: 1, scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 230, damping: 17, delay: DELAI_MOYENNE }}
      >
        <div className="text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black"
            style={{
              background: `linear-gradient(145deg, hsl(${profil.teinte} 62% 46%), hsl(${profil.teinte + 26} 58% 32%))`,
              boxShadow: `0 0 0 3px ${withAlpha(tint, 0.9)}, 0 0 28px ${withAlpha(tint, 0.45)}`,
            }}
          >
            {profil.initiale}
          </div>
          <p className="mt-1.5 max-w-[7rem] truncate text-[12px] font-black uppercase tracking-tight text-white/80">
            {profil.nom}, {profil.age}
          </p>
        </div>

        <div className="text-left">
          <p
            className="font-black leading-none tabular-nums"
            style={{
              fontSize: 'clamp(4rem, 21vw, 7rem)',
              color: tint,
              letterSpacing: '-0.05em',
              textShadow: `0 0 70px ${withAlpha(tint, 0.4)}`,
            }}
            aria-label={`Moyenne ${formatNote(moyenne)} sur 10`}
          >
            {formatNote(moyenne)}
          </p>
          <p className="text-sm font-black uppercase tracking-wide" style={{ color: tint }}>
            {scoreLabel(moyenne)}
          </p>
        </div>
      </motion.div>

      {/* ── La fin ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: DELAI_MOYENNE + 0.25 }}
        className="mt-5 rounded-2xl px-4 py-4 text-center"
        style={{ background: withAlpha(tint, 0.09), border: `1px solid ${withAlpha(tint, 0.28)}` }}
      >
        <p
          className="font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.6rem, 8vw, 2.2rem)', color: tint }}
        >
          {fin.title}
        </p>
        <p className="mt-2 text-[13px] font-semibold leading-snug text-white/65">{fin.subtitle}</p>
      </motion.div>

      {/* ── Toi contre les autres ────────────────────────────────────────── */}
      {moyenneCommunaute !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: DELAI_MOYENNE + 0.4 }}
          className="mt-4 rounded-2xl px-4 py-3.5"
          style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Echelle label="Toi" valeur={moyenne} fort />
          <div className="h-2" />
          <Echelle label="Les autres" valeur={moyenneCommunaute} />
          <p className="mt-2.5 text-center text-[12px] font-bold text-white/55">
            {Math.abs(moyenne - moyenneCommunaute) < 0.5
              ? 'Tu lui mets ce que tout le monde lui met.'
              : moyenne < moyenneCommunaute
                ? `Tu es ${formatNote(moyenneCommunaute - moyenne)} point${moyenneCommunaute - moyenne >= 2 ? 's' : ''} plus dur que les autres avec ${profil.nom}.`
                : `Tu es ${formatNote(moyenne - moyenneCommunaute)} point${moyenne - moyenneCommunaute >= 2 ? 's' : ''} plus indulgent que les autres avec ${profil.nom}.`}
          </p>
        </motion.div>
      )}

      {/* ── Détail par red flag ──────────────────────────────────────────── */}
      <p className="mt-6 mb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        Tes 5 notes
      </p>

      <div className="flex flex-col gap-1.5">
        {propositions.map((p, i) => {
          const autres = communaute[i];
          return (
            <div
              key={p.id}
              className="rounded-xl px-3.5 py-2.5"
              style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-px shrink-0 text-xs">🚩</span>
                <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white/75">
                  {p.text}
                </p>
                <span
                  className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg px-1.5 text-sm font-black tabular-nums"
                  style={{ background: withAlpha(scoreColor(notes[i]), 0.16), color: scoreColor(notes[i]) }}
                >
                  {notes[i]}
                </span>
              </div>

              {(autres !== null || (i === plusLourd && poids >= 0.5)) && (
                <p className="mt-1.5 pl-6 text-[12px] font-bold text-white/50">
                  {autres !== null && <>Les autres : {formatNote(autres)}</>}
                  {autres !== null && i === plusLourd && poids >= 0.5 && ' · '}
                  {i === plusLourd && poids >= 0.5 && (
                    <span className="text-red-400/80">lui coûte {formatNote(poids)} point{poids >= 2 ? 's' : ''} de moyenne</span>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Suite ────────────────────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 z-10 mt-6 -mx-5 space-y-2 px-5 pt-4"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
          background: 'linear-gradient(to top, #07070A 62%, rgba(7,7,10,0))',
        }}
      >
        {loadFailed && (
          <p className="text-center text-xs font-bold text-red-400">
            Impossible de charger le profil suivant. Réessaie.
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full cursor-pointer rounded-2xl py-4 text-base font-black uppercase tracking-widest text-black"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)',
            boxShadow: '0 6px 30px rgba(245,158,11,0.4)',
          }}
        >
          Profil suivant →
        </motion.button>

        {/* Le bilan n'apparaît qu'à partir du deuxième profil : sur un seul,
            il ne dirait rien de plus que cet écran. */}
        {sessionCount >= 2 && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReport}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.35)',
              color: '#C4B5FD',
            }}
          >
            <BarChart3 size={13} />
            Mon bilan · {sessionCount} profils
          </motion.button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={share}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest text-white/70"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied ? 'Copié' : 'Partager'}
          </button>
          <Link
            href="/dixmais/leaderboard"
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.22)',
              color: '#F59E0B',
            }}
          >
            <Trophy size={13} /> Classement
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/** Une barre de 0 à 10 : deux longueurs se comparent d'un coup d'œil. */
function Echelle({ label, valeur, fort = false }: { label: string; valeur: number; fort?: boolean }) {
  const couleur = fort ? scoreColor(valeur) : 'rgba(255,255,255,0.35)';
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-[68px] shrink-0 text-[10px] font-black uppercase tracking-wide ${fort ? 'text-white/75' : 'text-white/35'}`}>
        {label}
      </span>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(valeur / 10) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: DELAI_MOYENNE + 0.4 }}
          className="h-full rounded-full"
          style={{ background: couleur }}
        />
      </div>
      <span className="w-[34px] shrink-0 text-right text-[13px] font-black tabular-nums" style={{ color: fort ? couleur : 'rgba(255,255,255,0.45)' }}>
        {formatNote(valeur)}
      </span>
    </div>
  );
}
