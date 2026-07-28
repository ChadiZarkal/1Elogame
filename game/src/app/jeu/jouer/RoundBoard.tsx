'use client';

/**
 * @module jeu/jouer/RoundBoard
 * Le bulletin de vote, puis son dépouillement.
 *
 * Choix et résultat sont **le même composant** : au dépouillement, les cartes
 * ne sont pas remplacées, elles se **réordonnent** vers le classement de la
 * communauté en glissant les unes au-dessus des autres, et se teintent du rouge
 * au vert.
 *
 * Ce n'est pas un effet décoratif : c'est l'explication du jeu. Le joueur qui
 * cherchait « le red flag » parmi quatre comportements anodins voit ici, en une
 * seconde, que les propositions occupent une échelle de gravité et que désigner
 * la pire a toujours un sens.
 */

import { motion } from 'framer-motion';
import type { ElementDTO, VoteResult } from '@/types/game';
import { ACCENT, orderByRanking, positionLabel, severityColor, withAlpha } from './verdict';

interface Props {
  elements: ElementDTO[];
  /** Choix du joueur, `null` tant qu'il n'a pas tranché. */
  pickedId: string | null;
  ranking: NonNullable<VoteResult['ranking']>;
  /** Le classement est arrivé : les cartes peuvent se réordonner. */
  revealed: boolean;
  onPick: (id: string) => void;
  disabled: boolean;
}

const SPRING = { type: 'spring', stiffness: 320, damping: 32 } as const;

export function RoundBoard({ elements, pickedId, ranking, revealed, onPick, disabled }: Props) {
  const ordered = revealed ? orderByRanking(elements, ranking) : elements;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {ordered.map((element, position) => (
        <Choice
          key={element.id}
          element={element}
          slot={elements.findIndex(e => e.id === element.id)}
          position={position}
          total={ordered.length}
          picked={pickedId === element.id}
          settled={pickedId !== null}
          revealed={revealed}
          onPick={onPick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface ChoiceProps {
  element: ElementDTO;
  /** Position d'origine dans le bulletin, pour la numérotation. */
  slot: number;
  /** Position au classement une fois dépouillé. */
  position: number;
  total: number;
  picked: boolean;
  settled: boolean;
  revealed: boolean;
  onPick: (id: string) => void;
  disabled: boolean;
}

function Choice({
  element, slot, position, total, picked, settled, revealed, onPick, disabled,
}: ChoiceProps) {
  const tint = revealed ? severityColor(position, total) : ACCENT;

  // Avant le dépouillement, seule la carte choisie s'allume. Après, chacune
  // porte sa propre couleur de gravité.
  const lit = revealed || picked;
  const dimmed = settled && !picked && !revealed;

  return (
    <motion.button
      layout
      transition={SPRING}
      onClick={() => onPick(element.id)}
      disabled={disabled || settled}
      animate={{ opacity: dimmed ? 0.4 : 1, scale: picked && !revealed ? 1.02 : 1 }}
      whileTap={settled ? undefined : { scale: 0.975 }}
      className="relative flex min-h-[70px] flex-1 items-center gap-3 overflow-hidden rounded-2xl px-3.5 text-left"
      style={{
        background: lit ? withAlpha(tint, 0.12) : 'rgba(255,255,255,0.045)',
        border: `1.5px solid ${lit ? withAlpha(tint, 0.85) : 'rgba(255,255,255,0.09)'}`,
        boxShadow: picked ? `0 0 28px ${withAlpha(tint, 0.35)}` : 'none',
        cursor: disabled || settled ? 'default' : 'pointer',
      }}
    >
      {/* Repère de gauche : le numéro du bulletin, puis le rang au classement. */}
      <span
        className="w-7 shrink-0 text-center font-black tabular-nums"
        style={{
          fontSize: revealed ? '1.35rem' : '1.6rem',
          color: lit ? tint : 'rgba(255,255,255,0.16)',
          lineHeight: 1,
        }}
      >
        {revealed ? position + 1 : slot + 1}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="block font-bold leading-snug text-white"
          style={{ fontSize: 'clamp(0.95rem, 4.1vw, 1.15rem)' }}
        >
          {element.texte}
        </span>

        {revealed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-1 flex items-center gap-1.5"
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.16em]"
              style={{ color: tint }}
            >
              {positionLabel(position, total)}
            </span>
            {picked && (
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                · ton choix
              </span>
            )}
          </motion.span>
        )}
      </span>

      {/* Pastille du choix, avant que le classement ne prenne le relais. */}
      {picked && !revealed && (
        <motion.span
          layout
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]"
          style={{ background: withAlpha(ACCENT, 0.2), color: ACCENT }}
        >
          Ton choix
        </motion.span>
      )}
    </motion.button>
  );
}
