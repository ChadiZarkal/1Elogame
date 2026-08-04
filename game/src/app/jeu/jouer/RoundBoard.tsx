'use client';

/**
 * @module jeu/jouer/RoundBoard
 * Le bulletin de vote, puis son dépouillement.
 *
 * Choix et résultat sont **le même composant** : au dépouillement, les tuiles ne
 * sont pas remplacées, elles se **réordonnent** vers le classement de la
 * communauté et se **remplissent** de leur couleur de gravité, du rouge au vert,
 * de haut en bas et en cascade.
 *
 * Ce n'est pas de la décoration : c'est l'explication du jeu. Le joueur qui
 * cherchait « le red flag » parmi quatre comportements anodins voit ici, en une
 * seconde, que les propositions occupent une échelle et que désigner la pire a
 * toujours un sens.
 *
 * Avant le vote, les tuiles sont volontairement **indifférenciées** : donner à
 * l'une un ton plus chaud qu'aux autres orienterait le choix, et le biais
 * finirait directement dans les scores Elo.
 */

import { motion } from 'framer-motion';
import type { ElementDTO, VoteResult } from '@/types/game';
import { ACCENT, orderByRanking, positionLabel, severityColor, withAlpha } from './verdict';

interface Props {
  elements: ElementDTO[];
  /** Choix du joueur, `null` tant qu'il n'a pas tranché. */
  pickedId: string | null;
  ranking: NonNullable<VoteResult['ranking']>;
  /** Le classement est arrivé : les tuiles peuvent se réordonner et s'allumer. */
  revealed: boolean;
  onPick: (id: string) => void;
  disabled: boolean;
}

const REORDER = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function RoundBoard({ elements, pickedId, ranking, revealed, onPick, disabled }: Props) {
  const ordered = revealed ? orderByRanking(elements, ranking) : elements;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {ordered.map((element, position) => (
        <Tile
          key={element.id}
          element={element}
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

interface TileProps {
  element: ElementDTO;
  position: number;
  total: number;
  picked: boolean;
  settled: boolean;
  revealed: boolean;
  onPick: (id: string) => void;
  disabled: boolean;
}

function Tile({ element, position, total, picked, settled, revealed, onPick, disabled }: TileProps) {
  const tint = severityColor(position, total);
  const worst = revealed && position === 0;

  // Avant le dépouillement, seul le choix du joueur s'allume, en accent neutre.
  const preTint = picked ? ACCENT : null;

  return (
    <motion.button
      layout
      transition={REORDER}
      onClick={() => onPick(element.id)}
      disabled={disabled || settled}
      animate={{
        opacity: settled && !picked && !revealed ? 0.32 : 1,
        scale: picked && !revealed ? 1.015 : 1,
      }}
      whileTap={settled ? undefined : { scale: 0.975 }}
      className="relative flex min-h-[64px] flex-1 items-center overflow-hidden rounded-[22px] text-left"
      style={{
        // Verre sombre : la lumière vient du haut, comme sur une surface
        // physique. C'est ce qui distingue une tuile d'un simple rectangle.
        background:
          'linear-gradient(157deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.045) 100%)',
        border: `1px solid ${preTint ? withAlpha(preTint, 0.9) : 'rgba(255,255,255,0.085)'}`,
        boxShadow: picked && !revealed
          ? `0 0 0 1.5px ${withAlpha(ACCENT, 0.65)}, 0 10px 34px -12px ${withAlpha(ACCENT, 0.75)}`
          : 'inset 0 1px 0 rgba(255,255,255,0.07)',
        cursor: disabled || settled ? 'default' : 'pointer',
        transition: 'border-color 280ms ease, box-shadow 280ms ease',
      }}
    >
      {/* Nappe de gravité : arrive en cascade, du pire au plus toléré. Un
          calque d'opacité plutôt qu'un changement de dégradé — un dégradé ne
          s'interpole pas. */}
      <motion.span
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.45, delay: revealed ? 0.12 + position * 0.1 : 0 }}
        style={{
          background: `linear-gradient(100deg, ${withAlpha(tint, 0.34)} 0%, ${withAlpha(tint, 0.06)} 72%, transparent 100%)`,
        }}
      />

      {/* Tranche de couleur : donne du poids au classement. */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, width: revealed ? 5 : 0 }}
        transition={{ duration: 0.4, delay: revealed ? 0.12 + position * 0.1 : 0 }}
        style={{ background: tint }}
      />

      <span className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pl-4 pr-2">
        <span
          className="block font-black leading-[1.15] tracking-[-0.015em] text-white"
          style={{
            // Le comportement est le héros de l'écran : il occupe la place.
            fontSize: revealed ? 'clamp(0.95rem, 4.2vw, 1.15rem)' : 'clamp(1.1rem, 5vw, 1.45rem)',
            transition: 'font-size 300ms ease',
            textShadow: '0 1px 12px rgba(0,0,0,0.45)',
          }}
        >
          {element.texte}
        </span>

        {revealed && (
          <motion.span
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + position * 0.1 }}
            className="flex items-center gap-1.5"
          >
            <span
              className="text-[9.5px] font-black uppercase tracking-[0.18em]"
              style={{ color: tint }}
            >
              {positionLabel(position, total)}
            </span>
            {picked && (
              <span className="rounded-full bg-white px-1.5 py-[2px] text-[8.5px] font-black uppercase tracking-[0.14em] text-black">
                ton choix
              </span>
            )}
          </motion.span>
        )}
      </span>

      {/* Chiffre du rang, en colonne dédiée : traité comme un élément
          graphique, pas comme une puce de liste. */}
      {revealed && (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.18 + position * 0.1 }}
          className="relative z-10 w-[54px] shrink-0 text-center font-black tabular-nums"
          style={{
            fontSize: worst ? '2.7rem' : '2.1rem',
            lineHeight: 0.9,
            color: tint,
            opacity: worst ? 1 : 0.55,
            textShadow: worst ? `0 0 26px ${withAlpha(tint, 0.6)}` : 'none',
          }}
        >
          {position + 1}
        </motion.span>
      )}

      {/* Avant le dépouillement, le choix se marque sans introduire de couleur
          de gravité prématurée. */}
      {picked && !revealed && (
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 mr-3.5 shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]"
          style={{ background: ACCENT, color: '#08080C' }}
        >
          Ton choix
        </motion.span>
      )}
    </motion.button>
  );
}
