'use client';

/**
 * @module dixmais/ProfileCard
 * La personne notée, et la révélation du moment.
 *
 * Deux choses à l'écran, pas davantage : en haut, petite, la personne et sa
 * moyenne qui se construit ; au centre, en grand et sans cadre, la phrase à
 * juger. La progression est dans l'en-tête, la note dans la jauge — rien n'est
 * dit deux fois.
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { DixMaisStatement } from '@/types/database';
import type { ProfileIdentity } from './profile';
import { scoreColor, scoreInk } from './scale';
import { formatNote } from './moyenne';
import { TEINTES } from './ui';
import type { Flash } from './useDixMais';

interface Props {
  identity: ProfileIdentity;
  statements: DixMaisStatement[];
  index: number;
  /** Moyenne des notes déjà posées, `null` avant la première. */
  moyenne: number | null;
  flash: Flash | null;
}

const COURT = '[@media(max-height:620px)]:';

export function ProfileCard({ identity, statements, index, moyenne, flash }: Props) {
  const current = statements[index];
  const moyenneAffichee = flash ? flash.moyenne : moyenne;
  const vert = current?.type === 'positive';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ── La personne ─────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
          style={{
            background: `linear-gradient(145deg, hsl(${identity.hue} 55% 46%), hsl(${identity.hue + 26} 50% 30%))`,
          }}
        >
          {identity.initial}
        </div>

        <p className="min-w-0 flex-1 truncate text-[15px] font-bold" style={{ color: TEINTES.texte }}>
          {identity.name}, {identity.age}
        </p>

        {/* La moyenne vit sur la personne : c'est elle qui deviendra sa note. */}
        <div
          className="shrink-0 text-right"
          aria-label={moyenneAffichee === null ? 'Pas encore de moyenne' : `Moyenne ${formatNote(moyenneAffichee)} sur 10`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TEINTES.discret }}>
            Moyenne
          </p>
          <motion.p
            key={moyenneAffichee === null ? 'vide' : formatNote(moyenneAffichee)}
            initial={{ opacity: 0.4, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-black leading-tight tabular-nums"
            style={{ color: moyenneAffichee === null ? TEINTES.discret : scoreColor(moyenneAffichee) }}
          >
            {moyenneAffichee === null ? '—' : formatNote(moyenneAffichee)}
          </motion.p>
        </div>
      </div>

      {/* ── La phrase ───────────────────────────────────────────────────── */}
      {/* Défilante et centrée « safe » : une phrase trop longue pour un
          320 × 568 défile au lieu d'être rognée par le haut. */}
      <div className={`scrollbar-hide relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-4 [justify-content:safe_center] ${COURT}py-2`}>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 14 }}
            // Pendant le bilan du coup, la phrase s'efface derrière la note
            // plutôt que d'être masquée par un aplat, qui trancherait sur le
            // halo du fond.
            animate={{ opacity: flash ? 0 : 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="shrink-0 text-center"
          >
            <p
              className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em]"
              style={{ color: vert ? TEINTES.vert : TEINTES.ambre }}
            >
              {vert ? '🟢 C’est un 10, et en plus…' : '🚩 C’est un 10, mais…'}
            </p>
            <p
              className={`mx-auto max-w-[22ch] text-[clamp(1.45rem,7.2vw,2rem)] font-black leading-[1.15] text-white [overflow-wrap:anywhere] ${COURT}text-[1.25rem]`}
            >
              {current.text}
            </p>
          </motion.div>
        )}

        {/* Bilan du coup : la note posée, et la moyenne qu'elle donne. */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="text-6xl font-black leading-none tabular-nums"
                style={{ color: scoreInk(flash.note) }}
              >
                {flash.note}
              </motion.span>
              <span className="mt-2 text-[13px] font-semibold" style={{ color: TEINTES.secondaire }}>
                Moyenne{' '}
                <span className="font-black tabular-nums" style={{ color: scoreColor(flash.moyenne) }}>
                  {formatNote(flash.moyenne)}
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
