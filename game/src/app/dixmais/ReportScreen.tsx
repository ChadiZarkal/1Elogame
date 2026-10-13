'use client';

/**
 * @module dixmais/Report
 * Le bilan de session : tous les profils jugés, et ce qu'ils disent du joueur.
 *
 * En entonnoir : d'abord le portrait — c'est ce qu'on partage —, puis le
 * classement des profils de la soirée, puis les chiffres qui justifient le
 * portrait. Chaque bloc dont la donnée manque disparaît au lieu d'afficher un
 * tiret.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Check, Users, Crown, Ban, Heart, Scale } from 'lucide-react';
import type { PlayerProfile } from '@/types/game';
import { MAX_SCORE, scoreColor, withAlpha } from './scale';
import {
  construireBilan,
  formatNote,
  libelleCategorie,
  phraseSeverite,
  type ProfilJuge,
} from './moyenne';
import {
  cohortDative,
  cohortSentence,
  compareToCohort,
  fetchCohortStats,
  statementIdsOf,
  type CohortComparison,
} from './cohort';

const SHARE_URL = 'https://redorgreen.fr/dixmais';
const VIOLET = '#8B5CF6';

/** « 1 profil », « 3 profils ». */
function plural(n: number, mot: string): string {
  return `${n} ${mot}${n >= 2 ? 's' : ''}`;
}

interface Props {
  rounds: ProfilJuge[];
  /** Sexe et tranche d'âge du joueur, `null` tant qu'il ne les a pas donnés. */
  profile: PlayerProfile | null;
  onBack: () => void;
  onNext: () => void;
}

export function ReportScreen({ rounds, profile, onBack, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const [cohort, setCohort] = useState<CohortComparison | null>(null);
  const bilan = useMemo(() => construireBilan(rounds), [rounds]);

  // La cohorte est la seule donnée qui ne voyage pas avec les phrases. Un seul
  // appel, en lecture, et l'écran se passe de sa réponse si elle n'arrive pas.
  useEffect(() => {
    if (!profile) return;
    let abandonne = false;
    fetchCohortStats(statementIdsOf(rounds), profile)
      .then((stats) => { if (!abandonne) setCohort(compareToCohort(rounds, stats)); })
      .catch(() => { if (!abandonne) setCohort(null); });
    return () => { abandonne = true; };
  }, [rounds, profile]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const severite = phraseSeverite(bilan.severite);
  const premier = bilan.classement[0];

  const share = async () => {
    const top = premier ? ` Mon préféré : ${premier.nom}, ${formatNote(premier.moyenne)}/10.` : '';
    const text = `${bilan.profils} profils jugés, ${formatNote(bilan.noteMoyenne)}/10 en moyenne par révélation. Verdict : ${bilan.archetype.title} ${bilan.archetype.emoji}.${top} Et toi, tu vaux quoi comme juré ?`;
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
      key="report"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto overscroll-contain px-5"
    >
      <div className="pt-1 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/40">
          Ta soirée · {plural(bilan.profils, 'profil')} · {plural(bilan.jugements, 'révélation')}
        </p>
      </div>

      {/* ── Le portrait ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 210, damping: 18 }}
        className="mt-3 rounded-2xl px-4 py-5 text-center"
        style={{
          background: `linear-gradient(160deg, ${withAlpha(VIOLET, 0.16)}, rgba(255,255,255,0.02))`,
          border: `1px solid ${withAlpha(VIOLET, 0.34)}`,
        }}
      >
        <p className="text-[40px] leading-none">{bilan.archetype.emoji}</p>
        <p
          className="mt-2 font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.7rem, 8.5vw, 2.4rem)', color: '#C4B5FD' }}
        >
          {bilan.archetype.title}
        </p>
        <p className="mx-auto mt-2.5 max-w-[30ch] text-[13px] font-semibold leading-snug text-white/70">
          {bilan.archetype.tagline}
        </p>
      </motion.div>

      {/* ── Les compteurs ────────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Figure label="Profils" value={String(bilan.profils)} tint="#FFD700" />
        <Figure
          label="Par info"
          value={formatNote(bilan.noteMoyenne)}
          tint={scoreColor(bilan.noteMoyenne)}
        />
        <Figure label="Zéros" value={`${Math.round(bilan.zeros)} %`} tint="#EF4444" />
      </div>

      {/* ── Le classement de la soirée ───────────────────────────────────── */}
      <Block title="Ton classement" icon={<Crown size={12} />}>
        <ol className="flex flex-col gap-1.5">
          {bilan.classement.map((p, rang) => {
            const couleur = scoreColor(p.moyenne);
            return (
              <li key={p.numero} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center text-[12px] font-black tabular-nums text-white/40">
                  {rang === 0 ? '👑' : rang + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13px] font-black text-white/85">
                      {p.nom}, {p.age}
                    </span>
                    <span className="shrink-0 text-[14px] font-black tabular-nums" style={{ color: couleur }}>
                      {formatNote(p.moyenne)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.moyenne / MAX_SCORE) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 * rang }}
                      className="h-full rounded-full"
                      style={{ background: couleur }}
                    />
                  </div>
                  <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-white/30">
                    {p.fin}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Block>

      {/* ── Sévérité ─────────────────────────────────────────────────────── */}
      {bilan.severite && severite && (
        <Block title="Ta sévérité">
          <Versus mine={bilan.severite.moi} theirs={bilan.severite.autres} theirsLabel="Les autres" />
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">{severite}</p>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
            Note moyenne d&apos;une révélation · {plural(bilan.severite.echantillon, 'révélation')} assez votées
          </p>
        </Block>
      )}

      {/* ── Face aux gens comme toi ──────────────────────────────────────── */}
      {profile && cohort && (
        <Block title={`Face ${cohortDative(profile)}`} icon={<Users size={12} />}>
          <Versus mine={cohort.mine} theirs={cohort.theirs} theirsLabel="Ta cohorte" />
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">
            {cohortSentence(cohort, profile)}
          </p>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
            {plural(cohort.votes, 'vote')} de ta cohorte sur {plural(cohort.sample, 'révélation')}
          </p>
        </Block>
      )}

      {/* ── Tes rédhibitoires ────────────────────────────────────────────── */}
      {bilan.redhibitoires.length > 0 && (
        <Block title="Tes rédhibitoires" icon={<Ban size={12} />}>
          <ul className="flex flex-col gap-1.5">
            {bilan.redhibitoires.slice(0, 5).map((j, i) => (
              <li key={`${j.text}-${i}`} className="flex items-start gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] font-black tabular-nums"
                  style={{ background: withAlpha(scoreColor(j.note), 0.18), color: scoreColor(j.note) }}
                >
                  {j.note}
                </span>
                <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white/75">{j.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* ── Ce que valent les qualités ───────────────────────────────────── */}
      {bilan.moyenneVerte !== null && bilan.moyenneRouge !== null && (
        <Block title="Red flags contre green flags" icon={<Scale size={12} />}>
          <div className="flex flex-col gap-2">
            <Barre label="🚩 Red" valeur={bilan.moyenneRouge} teinte={scoreColor(bilan.moyenneRouge)} fort />
            <Barre label="🟢 Green" valeur={bilan.moyenneVerte} teinte={scoreColor(bilan.moyenneVerte)} fort />
          </div>
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">
            {bilan.moyenneVerte <= 10.3
              ? 'Une qualité ne lui rapporte presque rien : chez toi, être bien, c’est le minimum.'
              : `Une qualité lui rapporte ${formatNote(bilan.moyenneVerte - 10)} point${bilan.moyenneVerte - 10 >= 2 ? 's' : ''} au-dessus du 10 ; un défaut lui en coûte ${formatNote(10 - bilan.moyenneRouge)}.`}
          </p>
        </Block>
      )}

      {/* ── Coups de cœur ────────────────────────────────────────────────── */}
      {bilan.coupsDeCoeur.length > 0 && (
        <Block title="Tes coups de cœur" icon={<Heart size={12} />}>
          <ul className="flex flex-col gap-1.5">
            {bilan.coupsDeCoeur.slice(0, 5).map((j, i) => (
              <li key={`${j.text}-${i}`} className="flex items-start gap-2.5">
                <span
                  className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1 text-[12px] font-black tabular-nums"
                  style={{ background: withAlpha(scoreColor(j.note), 0.18), color: scoreColor(j.note) }}
                >
                  {j.note}
                </span>
                <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white/75">{j.text}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* ── Par catégorie ────────────────────────────────────────────────── */}
      {bilan.categories.length >= 2 && (
        <Block title="Ce qui te fait décrocher">
          <div className="flex flex-col gap-2.5">
            {bilan.categories.slice(0, 5).map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12px] font-bold text-white/70">{libelleCategorie(c.category)}</span>
                  <span className="shrink-0 text-[10px] font-bold text-white/30">
                    {plural(c.nombre, 'révélation')}
                    {c.autres !== null && ` · les autres ${formatNote(c.autres)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.moi / MAX_SCORE) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: scoreColor(c.moi) }}
                    />
                  </div>
                  <span className="w-[34px] shrink-0 text-right text-[12px] font-black tabular-nums" style={{ color: scoreColor(c.moi) }}>
                    {formatNote(c.moi)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ── Les deux moments ─────────────────────────────────────────────── */}
      {bilan.intransigeance && (
        <Quote
          title="Ton intransigeance"
          text={bilan.intransigeance.text}
          detail={`Tu mets ${bilan.intransigeance.note}. Les autres ${formatNote(bilan.intransigeance.autres ?? 0)}.`}
          tint="#EF4444"
        />
      )}
      {bilan.angleMort && (
        <Quote
          title="Ton angle mort"
          text={bilan.angleMort.text}
          detail={`Les autres mettent ${formatNote(bilan.angleMort.autres ?? 0)}. Toi ${bilan.angleMort.note}.`}
          tint="#22C55E"
        />
      )}

      {/* ── Suite ────────────────────────────────────────────────────────── */}
      <div
        className="sticky bottom-0 z-10 mt-6 -mx-5 space-y-2 px-5 pt-4"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
          background: 'linear-gradient(to top, #07070A 62%, rgba(7,7,10,0))',
        }}
      >
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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onBack}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest text-white/70"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={13} /> Verdict
          </button>
          <button
            onClick={share}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest"
            style={{
              background: withAlpha(VIOLET, 0.12),
              border: `1px solid ${withAlpha(VIOLET, 0.35)}`,
              color: '#C4B5FD',
            }}
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied ? 'Copié' : 'Partager'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Briques
// ---------------------------------------------------------------------------

function Figure({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div
      className="rounded-xl px-2 py-3 text-center"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xl font-black tabular-nums leading-none" style={{ color: tint }}>
        {value}
      </p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-white/35">{label}</p>
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        {icon}
        {title}
      </p>
      <div
        className="rounded-2xl px-4 py-3.5"
        style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {children}
      </div>
    </div>
  );
}

/** Deux notes, deux barres sur la même échelle (0 à 15). */
function Versus({ mine, theirs, theirsLabel }: { mine: number; theirs: number; theirsLabel: string }) {
  const plusDur = mine < theirs;
  return (
    <div className="flex flex-col gap-2">
      <Barre label="Toi" valeur={mine} teinte={plusDur ? '#EF4444' : '#22C55E'} fort />
      <Barre label={theirsLabel} valeur={theirs} teinte="rgba(255,255,255,0.35)" />
    </div>
  );
}

function Barre({ label, valeur, teinte, fort }: { label: string; valeur: number; teinte: string; fort?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-[72px] shrink-0 text-[10px] font-black uppercase tracking-wide ${fort ? 'text-white/75' : 'text-white/35'}`}>
        {label}
      </span>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (valeur / MAX_SCORE) * 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: teinte }}
        />
      </div>
      <span
        className="w-[40px] shrink-0 text-right text-[12px] font-black tabular-nums"
        style={{ color: fort ? teinte : 'rgba(255,255,255,0.4)' }}
      >
        {formatNote(valeur)}
      </span>
    </div>
  );
}

function Quote({ title, text, detail, tint }: { title: string; text: string; detail: string; tint: string }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">{title}</p>
      <div
        className="rounded-2xl px-4 py-3.5"
        style={{ background: withAlpha(tint, 0.08), border: `1px solid ${withAlpha(tint, 0.26)}` }}
      >
        <p className="text-[14px] font-bold leading-snug text-white/85">« {text} »</p>
        <p className="mt-1.5 text-[12px] font-bold" style={{ color: withAlpha(tint, 0.85) }}>
          {detail}
        </p>
      </div>
    </div>
  );
}
