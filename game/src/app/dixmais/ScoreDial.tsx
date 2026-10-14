'use client';

/**
 * @module dixmais/ScoreDial
 * Jauge de notation d'une révélation, de 0 à 15.
 *
 * Elle part de 10 à chaque phrase : le joueur dit ce que la phrase coûte, ou,
 * pour un green flag, ce qu'elle rapporte au-delà du 10. Un 0 n'arrête rien :
 * c'est une note comme une autre, qui pèsera lourd dans la moyenne.
 *
 * Volontairement sobre : la note en grand, son libellé, une piste sans
 * chiffres dans les barres, et quatre repères dessous (0, 5, 10, 15). La zone
 * au-delà du 10 se signale par une teinte dorée, sans pointillés ni légende.
 *
 * Les tailles sont bornées en `vh` autant qu'en `vw` : sur un iPhone SE avec
 * les barres de Safari (553 px utiles), un dimensionnement purement horizontal
 * écrasait la phrase notée.
 */

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MAX_SCORE, START_SCORE, isBonus, scoreColor, scoreLabel, withAlpha } from './scale';
import { TEINTES } from './ui';

const STEPS = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i);
const REPERES = [0, 5, 10, 15];

interface Props {
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  disabled: boolean;
}

export function ScoreDial({ value, onChange, onCommit, disabled }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const tint = scoreColor(value);
  const untouched = value === START_SCORE;

  /** 16 cellules de largeur égale : l'index est une division directe.
   *
   * Sortir de la piste par la gauche n'est volontairement **pas** ramené à 0 :
   * un doigt qui dérape ne doit pas poser la note la plus lourde du jeu. */
  const pickFrom = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || clientX < rect.left) return;
    const index = Math.floor(((clientX - rect.left) / rect.width) * (MAX_SCORE + 1));
    onChange(Math.min(MAX_SCORE, index));
  }, [onChange]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    pickFrom(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || disabled) return;
    // Un relâchement non livré (onglet masqué, relâchement hors fenêtre)
    // laisserait la jauge suivre le curseur sans bouton enfoncé.
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      dragging.current = false;
      return;
    }
    pickFrom(e.clientX);
  };

  const stopDragging = () => { dragging.current = false; };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(value - 1); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(value + 1); }
  };

  return (
    <div className="w-full">
      {/* ── La note ─────────────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-center">
        <motion.span
          key={value}
          initial={{ scale: 0.86, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 28 }}
          className="font-black leading-none tabular-nums"
          style={{ fontSize: 'min(4.2rem, 15vw, 7.5vh)', color: tint, letterSpacing: '-0.04em' }}
        >
          {value}
        </motion.span>
        <span className="ml-1 text-base font-bold" style={{ color: TEINTES.discret }}>/10</span>
      </div>
      <p
        className="mt-1 mb-3 text-center text-[12px] font-bold uppercase tracking-[0.14em]"
        style={{ color: withAlpha(tint, 0.8) }}
      >
        {scoreLabel(value)}
      </p>

      {/* ── La piste ────────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Note de cette révélation, de 0 à 15"
        aria-valuemin={0}
        aria-valuemax={MAX_SCORE}
        aria-valuenow={value}
        aria-valuetext={`${value} sur 10, ${scoreLabel(value)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={stopDragging}
        onKeyDown={onKeyDown}
        // La zone sensible déborde des barres de quelques pixels : on attrape
        // la jauge sans viser au millimètre.
        className="relative flex w-full items-end gap-[3px] py-2 outline-none"
        style={{
          touchAction: 'none',
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'default' : 'pointer',
          transition: 'opacity 200ms ease',
        }}
      >
        {/* Le trait doré entre le 10 et la zone bonus. En absolu plutôt qu'en
            marge : une marge décalerait les cellules et fausserait la division
            qui traduit le doigt en note. Placé au milieu de l'espace entre la
            11ᵉ et la 12ᵉ barre : 11 seizièmes de la piste, corrigés des 10 et
            demi écarts de 3 px qui les précèdent. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-px"
          style={{
            left: `calc(${((START_SCORE + 1) / (MAX_SCORE + 1)) * 100}% + ${
              // − 0,5 : on centre le trait d'un pixel, pas son bord gauche.
              (START_SCORE + 0.5) * 3 - ((START_SCORE + 1) * 3 * MAX_SCORE) / (MAX_SCORE + 1) - 0.5
            }px)`,
            background: withAlpha(TEINTES.or, 0.5),
          }}
        />
        {STEPS.map((step) => {
          const filled = step <= value;
          const isCurrent = step === value;
          const bonus = isBonus(step);
          return (
            <div
              key={step}
              // Positionnées, les barres passent devant le trait doré : l'anneau de
              // la note en cours le recouvre au lieu d'être barré par lui.
              className="relative flex-1 rounded-full"
              style={{
                height: 14 + step * 1.7,
                background: filled
                  ? tint
                  : bonus
                    ? withAlpha(TEINTES.or, 0.14)
                    : 'rgba(255,255,255,0.07)',
                boxShadow: isCurrent ? `0 0 0 2px ${TEINTES.fond}, 0 0 0 3.5px ${tint}` : 'none',
                transition: 'background-color 140ms ease',
              }}
            />
          );
        })}
      </div>

      {/* Quatre repères, centrés sous leur barre. Le 10 est le point de
          départ, le 15 le plafond doré. */}
      <div className="relative h-4" aria-hidden>
        {REPERES.map((r) => (
          <span
            key={r}
            className="absolute -translate-x-1/2 text-[11px] font-bold tabular-nums"
            style={{
              left: `${((r + 0.5) / (MAX_SCORE + 1)) * 100}%`,
              color: r === MAX_SCORE ? withAlpha(TEINTES.or, 0.7) : TEINTES.discret,
            }}
          >
            {r}
          </span>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onCommit}
        disabled={disabled}
        className="mt-3 w-full cursor-pointer rounded-2xl py-3.5 text-[15px] font-black uppercase tracking-wider"
        style={{
          background: value === 0 ? '#DC2626' : tint,
          color: value === 0 ? '#fff' : '#0A0A0B',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {value === 0
          ? '0 · Rédhibitoire'
          : untouched
            // Garder 10 est un choix valide : l'info ne change rien.
            ? 'Toujours un 10'
            : isBonus(value)
              ? `✨ ${value}/10`
              : `Valider ${value}`}
      </motion.button>
    </div>
  );
}
