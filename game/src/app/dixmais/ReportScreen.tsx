'use client';

/**
 * @module dixmais/Report
 * Le rapport de session : le bilan de tous les profils jugés depuis l'arrivée.
 *
 * Le verdict raconte une manche ; celui-ci raconte le joueur. L'écran est
 * construit en entonnoir : d'abord le portrait — c'est ce qu'on partage —,
 * puis les chiffres qui le justifient, puis le détail par catégorie, et enfin
 * la frise des profils pour se remémorer la soirée.
 *
 * Chaque bloc dont la donnée manque disparaît au lieu d'afficher un tiret : sur
 * deux profils, il ne reste que le portrait et les compteurs, et l'écran tient
 * quand même debout.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Check, Skull, Flame, Users } from 'lucide-react';
import type { PlayerProfile } from '@/types/game';
import { scoreColor, withAlpha } from './scale';
import type { PlayedRound } from './report';
import {
  buildReport,
  categoryLabel,
  categorySentence,
  eliminationSentence,
  greenFlagSentence,
  severitySentence,
} from './report';
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

function fr(n: number, digits = 1): string {
  return Math.abs(n).toFixed(digits).replace('.', ',');
}
function signed(n: number, digits = 1): string {
  return n > 0 ? `+${fr(n, digits)}` : `-${fr(n, digits)}`;
}
/** « 1 profil », « 3 profils » — le pluriel nu sortait sur tous les compteurs. */
function plural(n: number, mot: string): string {
  return `${n} ${mot}${n >= 2 ? 's' : ''}`;
}

interface Props {
  rounds: PlayedRound[];
  /** Sexe et tranche d'âge du joueur, `null` tant qu'il ne les a pas donnés. */
  profile: PlayerProfile | null;
  onBack: () => void;
  onNext: () => void;
}

export function ReportScreen({ rounds, profile, onBack, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const [cohort, setCohort] = useState<CohortComparison | null>(null);
  // Le rapport se recalcule entièrement à chaque rendu sinon, et il traverse
  // toutes les révélations de la session.
  const report = useMemo(() => buildReport(rounds), [rounds]);

  // La cohorte est la seule donnée du rapport qui ne soit pas déjà en main :
  // les compteurs par phrase voyagent avec les phrases, pas ceux par sexe et
  // par âge. Un seul appel, et l'écran se passe de sa réponse si elle n'arrive
  // pas — la base peut n'avoir encore aucun vote pour cette cohorte.
  useEffect(() => {
    // Pas de remise à zéro ici : l'affichage est déjà conditionné à `profile`,
    // et poser l'état dans le corps d'un effet provoque un rendu de plus.
    if (!profile) return;

    let abandonne = false;
    fetchCohortStats(statementIdsOf(rounds), profile)
      .then((stats) => {
        if (!abandonne) setCohort(compareToCohort(rounds, stats));
      })
      .catch(() => { if (!abandonne) setCohort(null); });

    return () => { abandonne = true; };
  }, [rounds, profile]);

  const severity = severitySentence(report.severity);
  const elimination = eliminationSentence(report.elimination);
  const greenFlags = greenFlagSentence(report);
  const category = categorySentence(report.categories);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const share = async () => {
    const gap = report.severity
      ? ` Je suis ${fr(report.severity.gap)} point plus ${report.severity.gap < 0 ? 'sévère' : 'gentil'} que la moyenne.`
      : '';
    const text = `${report.profiles} profils jugés, ${report.eliminated} éliminés. Verdict : ${report.archetype.title} ${report.archetype.emoji}.${gap} Et toi, tu vaux quoi comme juré ?`;
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
          Ta soirée · {plural(report.profiles, 'profil')} · {plural(report.judgments, 'révélation')}
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
        <p className="text-[40px] leading-none">{report.archetype.emoji}</p>
        <p
          className="mt-2 font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.7rem, 8.5vw, 2.4rem)', color: '#C4B5FD' }}
        >
          {report.archetype.title}
        </p>
        <p className="mx-auto mt-2.5 max-w-[30ch] text-[13px] font-semibold leading-snug text-white/70">
          {report.archetype.tagline}
        </p>
      </motion.div>

      {/* ── Les compteurs ────────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Figure label="Jugés" value={String(report.profiles)} tint="#FFD700" />
        <Figure
          label="Éliminés"
          value={String(report.eliminated)}
          tint="#EF4444"
          icon={<Skull size={11} />}
        />
        <Figure
          label="Note moyenne"
          value={fr(report.avgFinal, 1)}
          tint={scoreColor(Math.round(report.avgFinal))}
        />
      </div>

      {/* ── Sévérité ─────────────────────────────────────────────────────── */}
      {report.severity && severity && (
        <Block title="Ta sévérité">
          <Versus
            mine={report.severity.mine}
            theirs={report.severity.theirs}
            mineLabel="Toi"
            theirsLabel="La moyenne"
          />
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">{severity}</p>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
            Mesuré sur {plural(report.severity.sample, 'révélation')} assez votées
          </p>
        </Block>
      )}

      {/* ── Face aux gens comme toi ──────────────────────────────────────── */}
      {profile && cohort && (
        <Block title={`Face ${cohortDative(profile)}`} icon={<Users size={12} />}>
          <Versus
            mine={cohort.mine}
            theirs={cohort.theirs}
            mineLabel="Toi"
            theirsLabel="Ta cohorte"
          />
          <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">
            {cohortSentence(cohort, profile)}
          </p>
          {/* L'échantillon est annoncé : la cohorte est forcément plus étroite
              que la moyenne générale, et le lecteur doit pouvoir en juger. */}
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
            {plural(cohort.votes, 'vote')} de ta cohorte sur {plural(cohort.sample, 'révélation')}
          </p>
        </Block>
      )}

      {/* Rien n'est demandé ici : le profil est posé avant la première note,
          sur l'écran d'accueil. Un joueur sans profil n'a simplement pas de
          bloc de cohorte. */}

      {/* ── Le doigt sur la gâchette ─────────────────────────────────────── */}
      {elimination && (
        <Block title="Ta gâchette" icon={<Flame size={12} />}>
          <p className="text-[13px] font-semibold leading-snug text-white/75">{elimination}</p>
        </Block>
      )}

      {/* ── Les qualités ─────────────────────────────────────────────────── */}
      {greenFlags && (
        <Block title="Ce que valent les qualités">
          <p className="text-[13px] font-semibold leading-snug text-white/75">{greenFlags}</p>
        </Block>
      )}

      {/* ── Par catégorie ────────────────────────────────────────────────── */}
      {report.categories.length >= 2 && (
        <Block title="Ce qui te fait décrocher">
          <div className="flex flex-col gap-2">
            {report.categories.slice(0, 5).map((c) => (
              <CategoryRow key={c.category} stat={c} worst={report.categories[0].mine} />
            ))}
          </div>
          {category && (
            <p className="mt-3 text-[13px] font-semibold leading-snug text-white/75">{category}</p>
          )}
        </Block>
      )}

      {/* ── Les deux moments ─────────────────────────────────────────────── */}
      {report.harshest?.deviation !== null && report.harshest && report.harshest.deviation! <= -1.5 && (
        <Quote
          title="Ton intransigeance"
          text={report.harshest.text}
          detail={`Tu retires ${fr(report.harshest.delta, 0)}. Les autres ${fr(report.harshest.community ?? 0)}.`}
          tint="#EF4444"
        />
      )}
      {report.blindSpot?.deviation !== null && report.blindSpot && report.blindSpot.deviation! >= 1.5 && (
        <Quote
          title="Ton angle mort"
          text={report.blindSpot.text}
          detail={`Tout le monde retire ${fr(report.blindSpot.community ?? 0)}. Toi ${fr(report.blindSpot.delta, 0)}.`}
          tint="#22C55E"
        />
      )}

      {/* ── La frise des profils ─────────────────────────────────────────── */}
      <Block title="Tous tes verdicts">
        <div className="flex flex-col gap-1.5">
          {[...report.endings].reverse().map((e, i) => (
            <div
              key={`${e.key}-${report.endings.length - i}`}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.035)' }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black tabular-nums"
                style={{
                  background: withAlpha(scoreColor(e.final), 0.16),
                  color: scoreColor(e.final),
                }}
              >
                {e.final}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-black uppercase tracking-wide text-white/80">
                  {e.title}
                </p>
                <p className="truncate text-[10px] font-bold text-white/35">{e.name}</p>
              </div>
            </div>
          ))}
        </div>
      </Block>

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

function Figure({
  label, value, tint, icon,
}: { label: string; value: string; tint: string; icon?: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-2 py-3 text-center"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xl font-black tabular-nums leading-none" style={{ color: tint }}>
        {value}
      </p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wide text-white/35">
        {icon}
        {label}
      </p>
    </div>
  );
}

function Block({
  title, icon, children,
}: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
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

/**
 * Deux barres, une échelle commune. Un axe unique avec deux curseurs serait
 * plus compact, mais il faut alors lire une position ; deux longueurs se
 * comparent d'un coup d'œil, même à bout de bras dans un canapé.
 */
function Versus({
  mine, theirs, mineLabel, theirsLabel,
}: { mine: number; theirs: number; mineLabel: string; theirsLabel: string }) {
  const max = Math.max(Math.abs(mine), Math.abs(theirs), 1);
  const harsher = mine < theirs;

  return (
    <div className="flex flex-col gap-2">
      <Bar
        label={mineLabel}
        value={mine}
        ratio={Math.abs(mine) / max}
        tint={harsher ? '#EF4444' : '#22C55E'}
        strong
      />
      <Bar label={theirsLabel} value={theirs} ratio={Math.abs(theirs) / max} tint="rgba(255,255,255,0.35)" />
    </div>
  );
}

function Bar({
  label, value, ratio, tint, strong,
}: { label: string; value: number; ratio: number; tint: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-[72px] shrink-0 text-[10px] font-black uppercase tracking-wide ${strong ? 'text-white/75' : 'text-white/35'}`}
      >
        {label}
      </span>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ratio * 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: tint }}
        />
      </div>
      <span
        className="w-[46px] shrink-0 text-right text-[12px] font-black tabular-nums"
        style={{ color: strong ? tint : 'rgba(255,255,255,0.4)' }}
      >
        {signed(value)}
      </span>
    </div>
  );
}

function CategoryRow({ stat, worst }: { stat: { category: string; count: number; mine: number; theirs: number | null }; worst: number }) {
  const ratio = worst === 0 ? 0 : Math.abs(stat.mine) / Math.abs(worst);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-[12px] font-bold text-white/70">
          {categoryLabel(stat.category)}
        </span>
        <span className="shrink-0 text-[10px] font-bold text-white/30">
          {plural(stat.count, 'révélation')}
          {stat.theirs !== null && ` · les autres ${signed(stat.theirs)}`}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, ratio * 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: stat.mine <= -2 ? '#EF4444' : stat.mine < 0 ? '#F59E0B' : '#22C55E' }}
          />
        </div>
        <span className="w-[46px] shrink-0 text-right text-[12px] font-black tabular-nums text-white/70">
          {signed(stat.mine)}
        </span>
      </div>
    </div>
  );
}

function Quote({
  title, text, detail, tint,
}: { title: string; text: string; detail: string; tint: string }) {
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
