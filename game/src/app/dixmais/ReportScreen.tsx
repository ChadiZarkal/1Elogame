'use client';

/**
 * @module dixmais/Report
 * Le bilan de session : tous les profils jugés, et ce qu'ils disent du joueur.
 *
 * En entonnoir : le portrait d'abord — c'est ce qu'on partage —, puis le
 * classement de la soirée, puis les chiffres qui justifient le portrait. Pas
 * de cadres : des sections séparées par un filet, et la couleur réservée aux
 * notes. Chaque section dont la donnée manque disparaît.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import type { PlayerProfile } from '@/types/game';
import { MAX_SCORE, scoreColor, scoreInk } from './scale';
import {
  construireBilan,
  formatNote,
  libelleCategorie,
  phraseSeverite,
  type Jugement,
  type ProfilJuge,
} from './moyenne';
import {
  cohortSentence,
  compareToCohort,
  fetchCohortStats,
  statementIdsOf,
  type CohortComparison,
} from './cohort';
import { BoutonDiscret, BoutonPrincipal, Pastille, Pied, Section, TEINTES } from './ui';

const SHARE_URL = 'https://redorgreen.fr/dixmais';

/** « 1 profil », « 3 profils ». */
function plural(n: number, mot: string): string {
  return `${n} ${mot}${n >= 2 ? 's' : ''}`;
}

interface Props {
  rounds: ProfilJuge[];
  /** Sexe et tranche d'âge du joueur, `null` tant qu'il ne les a pas donnés. */
  profile: PlayerProfile | null;
  /** Session du joueur, exclue de sa cohorte. */
  getSessionId?: () => string;
  onBack: () => void;
  onNext: () => void;
}

export function ReportScreen({ rounds, profile, getSessionId, onBack, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const [cohort, setCohort] = useState<CohortComparison | null>(null);
  const bilan = useMemo(() => construireBilan(rounds), [rounds]);

  // La cohorte est la seule donnée qui ne voyage pas avec les phrases. Un seul
  // appel, en lecture, et l'écran se passe de sa réponse si elle n'arrive pas.
  useEffect(() => {
    if (!profile) return;
    let abandonne = false;
    fetchCohortStats(statementIdsOf(rounds), profile, getSessionId?.())
      .then((stats) => { if (!abandonne) setCohort(compareToCohort(rounds, stats)); })
      .catch(() => { if (!abandonne) setCohort(null); });
    return () => { abandonne = true; };
  }, [rounds, profile, getSessionId]);

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

  const faceAuxAutres = (bilan.severite && severite) || (profile && cohort);

  return (
    <motion.div
      key="report"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto overscroll-contain px-5"
    >
      {/* ── Le portrait ─────────────────────────────────────────────────── */}
      <div className="pt-2 pb-6 text-center">
        <p className="text-[12px] font-semibold" style={{ color: TEINTES.discret }}>
          Ta soirée · {plural(bilan.profils, 'profil')} · {plural(bilan.jugements, 'révélation')}
        </p>
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="mt-5 text-[44px] leading-none"
        >
          {bilan.archetype.emoji}
        </motion.p>
        <p className="mt-3 text-[clamp(1.6rem,8vw,2.2rem)] font-black uppercase leading-none tracking-tight text-white">
          {bilan.archetype.title}
        </p>
        <p className="mx-auto mt-3 max-w-[32ch] text-[14px] leading-snug" style={{ color: TEINTES.secondaire }}>
          {bilan.archetype.tagline}
        </p>
      </div>

      {/* ── Les chiffres ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 border-t py-4 text-center" style={{ borderColor: TEINTES.filet }}>
        <Chiffre valeur={String(bilan.profils)} label="Profils" />
        <Chiffre
          valeur={formatNote(bilan.noteMoyenne)}
          label="Note moyenne"
          couleur={scoreColor(bilan.noteMoyenne)}
          separe
        />
        <Chiffre valeur={`${Math.round(bilan.zeros)} %`} label="De zéros" separe />
      </div>

      {/* ── Le classement ───────────────────────────────────────────────── */}
      <Section titre="Ton classement">
        <ol className="space-y-3">
          {bilan.classement.map((p, rang) => (
            <li key={p.numero} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-center text-[13px] font-bold tabular-nums" style={{ color: TEINTES.discret }}>
                {rang === 0 ? '👑' : rang + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold" style={{ color: TEINTES.texte }}>
                  {p.nom}, {p.age}
                </p>
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide" style={{ color: TEINTES.discret }}>
                  {p.fin}
                </p>
              </div>
              <span className="shrink-0 text-[17px] font-black tabular-nums" style={{ color: scoreColor(p.moyenne) }}>
                {formatNote(p.moyenne)}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Face aux autres ─────────────────────────────────────────────── */}
      {faceAuxAutres && (
        <Section titre="Face aux autres">
          <div className="space-y-2.5">
            <Barre label="Toi" valeur={bilan.severite?.moi ?? cohort?.mine ?? 0} couleur={scoreColor(bilan.severite?.moi ?? cohort?.mine ?? 0)} fort />
            {bilan.severite && <Barre label="Tout le monde" valeur={bilan.severite.autres} />}
            {profile && cohort && <Barre label="Ta cohorte" valeur={cohort.theirs} />}
          </div>
          <div className="mt-3 space-y-1.5 text-[14px] leading-snug" style={{ color: TEINTES.secondaire }}>
            {severite && <p>{severite}</p>}
            {profile && cohort && <p>{cohortSentence(cohort, profile)}</p>}
          </div>
        </Section>
      )}

      {/* ── Red contre green ────────────────────────────────────────────── */}
      {bilan.moyenneVerte !== null && bilan.moyenneRouge !== null && (
        <Section titre="Red flags contre green flags">
          <div className="space-y-2.5">
            <Barre label="🚩 Red" valeur={bilan.moyenneRouge} couleur={scoreColor(bilan.moyenneRouge)} fort />
            <Barre label="🟢 Green" valeur={bilan.moyenneVerte} couleur={scoreColor(bilan.moyenneVerte)} fort />
          </div>
          <p className="mt-3 text-[14px] leading-snug" style={{ color: TEINTES.secondaire }}>
            {bilan.moyenneVerte <= 10.3
              ? 'Une qualité ne rapporte presque rien : chez toi, être bien, c’est le minimum.'
              : `Une qualité rapporte ${formatNote(bilan.moyenneVerte - 10)} au-dessus du 10 ; un défaut coûte ${formatNote(10 - bilan.moyenneRouge)}.`}
          </p>
        </Section>
      )}

      {/* ── Les extrêmes ────────────────────────────────────────────────── */}
      {bilan.coupsDeCoeur.length > 0 && (
        <Section titre="Tes coups de cœur">
          <Liste jugements={bilan.coupsDeCoeur.slice(0, 3)} />
        </Section>
      )}
      {bilan.redhibitoires.length > 0 && (
        <Section titre="Tes rédhibitoires">
          <Liste jugements={bilan.redhibitoires.slice(0, 3)} />
        </Section>
      )}

      {/* ── Par catégorie ───────────────────────────────────────────────── */}
      {bilan.categories.length >= 2 && (
        <Section titre="Ce qui te fait décrocher">
          <div className="space-y-2.5">
            {bilan.categories.slice(0, 4).map((c) => (
              <Barre key={c.category} label={libelleCategorie(c.category)} valeur={c.moi} couleur={scoreColor(c.moi)} fort large />
            ))}
          </div>
        </Section>
      )}

      {/* ── Les écarts ──────────────────────────────────────────────────── */}
      {(bilan.intransigeance || bilan.angleMort) && (
        <Section titre="Là où tu te démarques">
          <div className="space-y-4">
            {bilan.intransigeance && (
              <Ecart
                titre="Ton intransigeance"
                texte={bilan.intransigeance.text}
                detail={`Tu mets ${bilan.intransigeance.note}, les autres ${formatNote(bilan.intransigeance.autres ?? 0)}.`}
              />
            )}
            {bilan.angleMort && (
              <Ecart
                titre="Ton angle mort"
                texte={bilan.angleMort.text}
                detail={`Les autres mettent ${formatNote(bilan.angleMort.autres ?? 0)}, toi ${bilan.angleMort.note}.`}
              />
            )}
          </div>
        </Section>
      )}

      {/* ── Suite ───────────────────────────────────────────────────────── */}
      <Pied>
        <BoutonPrincipal onClick={onNext}>Profil suivant →</BoutonPrincipal>
        <div className="flex">
          <BoutonDiscret onClick={onBack}>
            <ArrowLeft size={15} /> Verdict
          </BoutonDiscret>
          <BoutonDiscret onClick={share}>
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'Copié' : 'Partager'}
          </BoutonDiscret>
        </div>
      </Pied>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Briques
// ---------------------------------------------------------------------------

function Chiffre({ valeur, label, couleur, separe }: { valeur: string; label: string; couleur?: string; separe?: boolean }) {
  return (
    <div className={separe ? 'border-l' : ''} style={{ borderColor: TEINTES.filet }}>
      <p className="text-[22px] font-black leading-none tabular-nums" style={{ color: couleur ?? TEINTES.texte }}>
        {valeur}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold" style={{ color: TEINTES.discret }}>
        {label}
      </p>
    </div>
  );
}

/** Une note sur la même échelle que la jauge (0 à 15). */
function Barre({
  label, valeur, couleur, fort, large,
}: { label: string; valeur: number; couleur?: string; fort?: boolean; large?: boolean }) {
  const teinte = couleur ?? 'rgba(255,255,255,0.3)';
  return (
    <div className="flex items-center gap-3">
      <span
        className={`${large ? 'w-[118px]' : 'w-[92px]'} shrink-0 truncate text-[13px]`}
        style={{ color: fort ? TEINTES.texte : TEINTES.secondaire }}
      >
        {label}
      </span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (valeur / MAX_SCORE) * 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: teinte }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-[14px] font-black tabular-nums" style={{ color: fort ? teinte : TEINTES.secondaire }}>
        {formatNote(valeur)}
      </span>
    </div>
  );
}

function Liste({ jugements }: { jugements: Jugement[] }) {
  return (
    <ul className="space-y-2.5">
      {jugements.map((j, i) => (
        <li key={`${j.text}-${i}`} className="flex items-start gap-3">
          <p className="min-w-0 flex-1 text-[14px] leading-snug" style={{ color: TEINTES.texte }}>{j.text}</p>
          <Pastille note={j.note} couleur={scoreInk(j.note)} taille="sm" />
        </li>
      ))}
    </ul>
  );
}

function Ecart({ titre, texte, detail }: { titre: string; texte: string; detail: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold" style={{ color: TEINTES.discret }}>{titre}</p>
      <p className="mt-0.5 text-[15px] font-semibold leading-snug" style={{ color: TEINTES.texte }}>« {texte} »</p>
      <p className="mt-0.5 text-[13px]" style={{ color: TEINTES.secondaire }}>{detail}</p>
    </div>
  );
}
