'use client';

/**
 * @module dixmais/ProfileCard
 * La personne notée, et le red flag du moment.
 *
 * Une seule phrase à l'écran, en grand : elle se juge seule. Ce qui relie les
 * cinq jugements, c'est la personne — son prénom, son visage, et sur sa tête
 * la moyenne qui se construit à chaque note. Les cinq cases sous l'en-tête
 * montrent où l'on en est et ce qu'on a déjà mis.
 */

import { AnimatePresence, motion } from 'framer-motion';
import type { DixMaisStatement } from '@/types/database';
import type { ProfileIdentity } from './profile';
import { scoreColor, withAlpha } from './scale';
import { formatNote } from './moyenne';
import type { Flash } from './useDixMais';

interface Props {
  identity: ProfileIdentity;
  statements: DixMaisStatement[];
  notes: number[];
  index: number;
  draft: number;
  /** Moyenne des notes déjà posées, `null` avant la première. */
  moyenne: number | null;
  flash: Flash | null;
}

export function ProfileCard({ identity, statements, notes, index, draft, moyenne, flash }: Props) {
  const current = statements[index];
  // La pastille de la personne porte la moyenne, pas la note en cours : c'est
  // elle qui « remonte » au profil.
  const moyenneAffichee = flash ? flash.moyenne : moyenne;
  const teinteMoyenne = moyenneAffichee === null ? 'rgba(255,255,255,0.35)' : scoreColor(moyenneAffichee);
  const tint = scoreColor(draft);

  return (
    <div
      // `min-h` : sur un écran court, la carte est le seul élément élastique
      // de la colonne ; sans plancher elle tombait à quelques pixels.
      className="flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 50px -30px ${withAlpha(tint, 0.9)}`,
      }}
    >
      {/* ── Identité et moyenne ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 px-4 pt-3 pb-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black"
          style={{
            background: `linear-gradient(145deg, hsl(${identity.hue} 62% 46%), hsl(${identity.hue + 26} 58% 32%))`,
            boxShadow: `0 0 0 2px ${withAlpha(teinteMoyenne, 0.85)}, 0 0 20px ${withAlpha(teinteMoyenne, 0.35)}`,
            transition: 'box-shadow 400ms ease',
          }}
        >
          {identity.initial}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black uppercase leading-none tracking-tight">
            {identity.name}, {identity.age}
          </p>
          <p className="mt-1 text-[11px] font-bold leading-none text-white/45">
            Red flag {Math.min(index + 1, statements.length)} sur {statements.length}
          </p>
        </div>

        <div
          className="shrink-0 rounded-xl px-2.5 py-1.5 text-center"
          style={{
            background: withAlpha(moyenneAffichee === null ? '#FFFFFF' : teinteMoyenne, 0.1),
            border: `1.5px solid ${moyenneAffichee === null ? 'rgba(255,255,255,0.14)' : withAlpha(teinteMoyenne, 0.5)}`,
            transition: 'background-color 200ms ease, border-color 200ms ease',
          }}
          aria-label={moyenneAffichee === null ? 'Pas encore de moyenne' : `Moyenne ${formatNote(moyenneAffichee)} sur 10`}
        >
          <p className="text-[9px] font-black uppercase leading-none tracking-wider text-white/40">
            Moyenne
          </p>
          <motion.p
            key={moyenneAffichee === null ? 'vide' : formatNote(moyenneAffichee)}
            initial={{ scale: 0.7, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-0.5 text-lg font-black leading-none tabular-nums"
            style={{ color: teinteMoyenne }}
          >
            {moyenneAffichee === null ? '—' : formatNote(moyenneAffichee)}
          </motion.p>
        </div>
      </div>

      {/* ── Les cinq cases ──────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-1.5 px-4 pb-1" aria-hidden>
        {statements.map((s, i) => {
          const note = notes[i];
          const juge = note !== undefined;
          const enCours = i === index && !juge;
          const couleur = juge ? scoreColor(note) : enCours ? '#FFD700' : 'rgba(255,255,255,0.14)';
          return (
            <div
              key={s.id}
              className="flex h-8 flex-1 items-center justify-center rounded-lg text-[13px] font-black tabular-nums"
              style={{
                background: juge ? withAlpha(couleur, 0.16) : enCours ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${juge ? withAlpha(couleur, 0.55) : enCours ? withAlpha('#FFD700', 0.6) : 'rgba(255,255,255,0.08)'}`,
                color: juge ? couleur : enCours ? '#FFD700' : 'rgba(255,255,255,0.2)',
              }}
            >
              {juge ? note : enCours ? '?' : ''}
            </div>
          );
        })}
      </div>

      {/* ── Le red flag du moment ───────────────────────────────────────── */}
      {/* Défilante et centrée « safe » : sur un 320 × 568, la phrase longue ne
          tient pas toujours ; elle doit alors défiler, pas être rognée par le
          haut comme le ferait un centrage simple. */}
      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-2 pb-3 [justify-content:safe_center]">
        <p
          className="mb-1.5 shrink-0 text-center font-black uppercase tracking-tight"
          style={{ color: '#FBBF24', fontSize: 'clamp(0.95rem, 4.6vw, 1.2rem)' }}
        >
          C&apos;est un 10, mais…
        </p>

        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative shrink-0 overflow-hidden rounded-2xl px-4 py-4 [@media(max-height:620px)]:py-3"
            style={{
              background: withAlpha('#F59E0B', 0.1),
              border: `1px solid ${withAlpha('#F59E0B', 0.3)}`,
            }}
          >
            <div className="flex items-start justify-center gap-2.5">
              <span className="shrink-0 text-lg leading-tight">🚩</span>
              <p
                className="min-w-0 text-center font-black leading-snug text-white [overflow-wrap:anywhere]"
                style={{ fontSize: 'clamp(1.2rem, 6vw, 1.7rem)' }}
              >
                {current.text}
              </p>
            </div>

            {/* Bilan du coup : la note posée, et ce qu'elle fait à la moyenne. */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center gap-4"
                  style={{ background: 'rgba(7,7,10,0.94)' }}
                >
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="text-5xl font-black leading-none tabular-nums"
                    style={{
                      color: scoreColor(flash.note),
                      textShadow: `0 0 34px ${withAlpha(scoreColor(flash.note), 0.6)}`,
                    }}
                  >
                    {flash.note}
                  </motion.span>
                  <span className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-white/35">
                      Moyenne
                    </span>
                    <span
                      className="block text-2xl font-black leading-none tabular-nums"
                      style={{ color: scoreColor(flash.moyenne) }}
                    >
                      {formatNote(flash.moyenne)}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
