'use client';

/**
 * @module dixmais/ScoreDial
 * Jauge de notation.
 *
 * Remplace la grille de boutons 1-10 de l'ancienne version. Une grille se lit
 * comme « réponds à cette question » : chaque appui semblait indépendant du
 * précédent, ce qui est exactement le contresens que faisaient les joueurs.
 *
 * La jauge, elle, **démarre sur la note précédente**. Le geste est un
 * ajustement, pas une saisie. Le joueur voit sa note actuelle avant de toucher
 * quoi que ce soit, et l'écart avec elle s'affiche en direct pendant qu'il
 * glisse.
 */

import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MAX_SCORE, formatDelta, scoreColor, scoreLabel, withAlpha } from './scale';

const STEPS = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i);

interface Props {
  value: number;
  previous: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  disabled: boolean;
  /** Affiche l'aide de premier lancement au-dessus de la jauge. */
  coach: boolean;
}

export function ScoreDial({ value, previous, onChange, onCommit, disabled, coach }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const tint = scoreColor(value);
  const delta = value - previous;
  const untouched = delta === 0;

  /** 11 cellules de largeur égale : l'index est une division directe. */
  const pickFrom = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const index = Math.floor(((clientX - rect.left) / rect.width) * (MAX_SCORE + 1));
    onChange(Math.min(MAX_SCORE, Math.max(0, index)));
  }, [onChange]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    pickFrom(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || disabled) return;
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
      {coach && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center text-[11px] font-bold leading-tight text-white/55"
        >
          Glisse la jauge pour poser ta note —{' '}
          <span style={{ color: tint }}>elle repartira de là</span> à la révélation suivante.
        </motion.p>
      )}

      {/* Lecture en direct : la note, et surtout l'écart avec la précédente. */}
      <div className="mb-1 flex items-center justify-center gap-3">
        <div className="flex items-baseline">
          <motion.span
            key={value}
            initial={{ scale: 0.82, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            className="font-black leading-none tabular-nums"
            style={{
              fontSize: 'clamp(3.4rem, 17vw, 4.6rem)',
              color: tint,
              letterSpacing: '-0.05em',
              textShadow: `0 0 44px ${withAlpha(tint, 0.45)}`,
            }}
          >
            {value}
          </motion.span>
          <span className="ml-1 text-lg font-black text-white/25">/10</span>
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

      <p
        className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.28em]"
        style={{ color: withAlpha(tint, 0.75) }}
      >
        {scoreLabel(value)}
      </p>

      {/* Escalier : la hauteur des barres encode la valeur, le remplissage
          encode la note choisie. Glissable et tapable. */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Note du profil sur 10"
        aria-valuemin={0}
        aria-valuemax={MAX_SCORE}
        aria-valuenow={value}
        aria-valuetext={`${value} sur 10, ${scoreLabel(value)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={onKeyDown}
        className="flex w-full items-end gap-[3px] rounded-2xl px-1 py-2"
        style={{
          touchAction: 'none',
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'default' : 'pointer',
          transition: 'opacity 200ms ease',
        }}
      >
        {STEPS.map((step) => {
          const filled = step <= value;
          const isCurrent = step === value;
          const isZero = step === 0;
          return (
            <div
              key={step}
              className="relative flex-1 rounded-md"
              style={{
                height: 26 + step * 3.8,
                background: filled ? tint : 'rgba(255,255,255,0.055)',
                border: `1px solid ${
                  isCurrent ? '#FFFFFF' : filled ? withAlpha(tint, 0.9) : 'rgba(255,255,255,0.09)'
                }`,
                boxShadow: isCurrent ? `0 0 18px ${withAlpha(tint, 0.7)}` : 'none',
                transition: 'background-color 140ms ease, box-shadow 140ms ease',
              }}
            >
              <span
                className="absolute inset-x-0 bottom-1 text-center text-[9px] font-black tabular-nums"
                style={{
                  color: filled ? 'rgba(0,0,0,0.55)' : isZero ? '#EF4444' : 'rgba(255,255,255,0.3)',
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
        className="mt-3 w-full cursor-pointer rounded-2xl py-4 text-base font-black uppercase tracking-widest"
        style={{
          background: value === 0 ? '#DC2626' : tint,
          color: value === 0 ? '#fff' : '#0A0A0B',
          boxShadow: `0 6px 28px ${withAlpha(value === 0 ? '#DC2626' : tint, 0.4)}`,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {value === 0
          ? '🚫 Éliminer'
          : untouched
            // Formulation volontaire : garder la même note est un choix valide,
            // et le dire à voix haute enseigne que la note se reporte.
            ? `Je garde ${value}`
            : `Valider ${value}`}
      </motion.button>
    </div>
  );
}
