'use client';

/**
 * @module dixmais/ScoreDial
 * Jauge de notation d'une révélation, de 0 à 15.
 *
 * Elle part de 10 à chaque phrase : « c'est un 10, mais… » — le joueur dit ce
 * que la phrase lui coûte, ou, pour un green flag, ce qu'elle lui rapporte au
 * delà du 10. L'écart avec 10 s'affiche en direct pendant qu'il glisse. Un 0
 * n'arrête plus rien : c'est une note comme une autre, qui pèsera lourd dans
 * la moyenne.
 *
 * La zone 11-15 est marquée à part — pointillés dorés, séparateur après le
 * 10 — pour qu'on comprenne d'un coup d'œil qu'au-delà, c'est du bonus.
 *
 * Les tailles sont bornées en `vh` autant qu'en `vw` : sur un iPhone SE avec
 * les barres de Safari (553 px utiles), un dimensionnement purement horizontal
 * écrasait la carte de profil jusqu'à la rendre illisible.
 */

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MAX_SCORE, START_SCORE, formatDelta, isBonus, scoreColor, scoreLabel, withAlpha } from './scale';

const STEPS = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i);

interface Props {
  value: number;
  previous: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  disabled: boolean;
}

export function ScoreDial({ value, previous, onChange, onCommit, disabled }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const tint = scoreColor(value);
  const delta = value - previous;
  const untouched = delta === 0;

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
      {/* Lecture en direct : la note, et ce qu'elle retire au 10 de départ. */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-baseline">
          <motion.span
            key={value}
            initial={{ scale: 0.82, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            className="font-black leading-none tabular-nums"
            style={{
              fontSize: 'min(4.6rem, 16vw, 7.5vh)',
              color: tint,
              letterSpacing: '-0.05em',
              textShadow: `0 0 44px ${withAlpha(tint, 0.45)}`,
            }}
          >
            {value}
          </motion.span>
          <span className="ml-1 text-base font-black text-white/25">/10</span>
        </div>

        {!untouched && (
          <motion.span
            key={delta}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full px-2.5 py-1 text-sm font-black tabular-nums"
            style={{
              color: tint,
              background: withAlpha(tint, 0.14),
              border: `1.5px solid ${withAlpha(tint, 0.4)}`,
            }}
          >
            {formatDelta(delta)}
          </motion.span>
        )}
      </div>

      {/* Libellé de la note au centre, légende des deux zones de part et
          d'autre : sur la même ligne, pour ne pas voler de hauteur à la phrase
          notée sur un écran de 568 px. 12 px pour le libellé : c'est le seul
          retour en mots pendant le geste. */}
      <div className="mt-0.5 mb-1 flex items-baseline justify-between gap-2">
        <span className="w-14 shrink-0 text-left text-[10px] font-black uppercase tracking-wider text-white/30" aria-hidden>
          ← coûte
        </span>
        <p
          className="min-w-0 truncate text-center text-[12px] font-black uppercase tracking-[0.16em]"
          style={{ color: withAlpha(tint, 0.75) }}
        >
          {scoreLabel(value)}
        </p>
        <span
          className="w-14 shrink-0 text-right text-[10px] font-black uppercase tracking-wider"
          style={{ color: withAlpha('#FFD700', 0.6) }}
          aria-hidden
        >
          bonus ✨
        </span>
      </div>

      {/* Escalier : la hauteur des barres encode la valeur, le remplissage
          encode la note choisie. Glissable et tapable — la zone sensible est
          toute la piste, les barres ne sont que la partie visible. */}
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
        className="relative flex w-full items-end gap-[2px] rounded-2xl px-1 py-1.5"
        style={{
          touchAction: 'none',
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'default' : 'pointer',
          transition: 'opacity 200ms ease',
        }}
      >
        {/* Séparateur entre le 10 et la zone bonus. Positionné en absolu
            plutôt qu'en marge : une marge décalerait les cellules et fausserait
            la division qui traduit le doigt en note. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-px"
          style={{
            left: `calc(0.25rem + (100% - 0.5rem) * ${(START_SCORE + 1) / (MAX_SCORE + 1)})`,
            background: withAlpha('#FFD700', 0.45),
          }}
        />
        {STEPS.map((step) => {
          const filled = step <= value;
          const isCurrent = step === value;
          const bonus = isBonus(step);
          return (
            <div
              key={step}
              className="relative flex-1 rounded-[5px]"
              style={{
                height: 16 + step * 2.1,
                background: filled ? tint : bonus ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.055)',
                border: `1px ${bonus && !filled ? 'dashed' : 'solid'} ${
                  isCurrent
                    ? '#FFFFFF'
                    : filled
                      ? withAlpha(tint, 0.9)
                      : bonus
                        ? 'rgba(255,215,0,0.3)'
                        : 'rgba(255,255,255,0.09)'
                }`,
                boxShadow: isCurrent ? `0 0 18px ${withAlpha(tint, 0.7)}` : 'none',
                transition: 'background-color 140ms ease, box-shadow 140ms ease',
              }}
            >
              <span
                className="absolute inset-x-0 bottom-0.5 text-center text-[10px] font-black tracking-tighter tabular-nums"
                style={{
                  color: filled
                    ? 'rgba(0,0,0,0.55)'
                    : step === 0
                      ? '#EF4444'
                      : bonus
                        ? 'rgba(255,215,0,0.55)'
                        : 'rgba(255,255,255,0.3)',
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onCommit}
        disabled={disabled}
        className="mt-2.5 w-full cursor-pointer rounded-2xl py-3.5 text-base font-black uppercase tracking-widest"
        style={{
          background: value === 0 ? '#DC2626' : tint,
          color: value === 0 ? '#fff' : '#0A0A0B',
          boxShadow: `0 6px 28px ${withAlpha(value === 0 ? '#DC2626' : tint, 0.4)}`,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {value === 0
          ? '🚫 0 · Rédhibitoire'
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
