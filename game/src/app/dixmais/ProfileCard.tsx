'use client';

/**
 * @module dixmais/ProfileCard
 * La personne notée, et tout ce qu'on sait d'elle.
 *
 * C'est ici que se joue la compréhension du jeu. L'ancienne version empilait
 * les révélations dans une zone défilante coincée entre l'en-tête et le clavier
 * de notation : passé la troisième, les premières sortaient de l'écran. Ce qui
 * disparaît de l'écran disparaît du raisonnement — d'où des joueurs qui notaient
 * la dernière phrase au lieu de noter la personne.
 *
 * Désormais : une seule carte, toutes les révélations dedans, reliées par ET /
 * MAIS pour se lire comme une phrase unique, et la note en cours affichée sur
 * la tête du profil pour qu'elle lui reste attachée.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DixMaisStatement } from '@/types/database';
import { connectorFor, type ProfileIdentity } from './profile';
import { formatDelta, scoreColor, withAlpha } from './scale';
import type { Flash } from './useDixMais';

interface Props {
  identity: ProfileIdentity;
  statements: DixMaisStatement[];
  ratings: number[];
  index: number;
  draft: number;
  flash: Flash | null;
}

export function ProfileCard({ identity, statements, ratings, index, draft, flash }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const tint = scoreColor(draft);
  const past = statements.slice(0, index);
  const current = statements[index];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [index]);

  return (
    <div
      // `min-h` : sans plancher, la carte est le seul élément élastique de la
      // colonne et absorbe toute la réduction de hauteur. Sur un écran court
      // elle tombait à quelques pixels, masquant la phrase à noter.
      className="flex min-h-[150px] flex-1 flex-col overflow-hidden rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 50px -30px ${withAlpha(tint, 0.9)}`,
      }}
    >
      {/* ── Identité ─────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black"
          style={{
            background: `linear-gradient(145deg, hsl(${identity.hue} 62% 46%), hsl(${identity.hue + 26} 58% 32%))`,
            boxShadow: `0 0 0 2px ${withAlpha(tint, 0.85)}, 0 0 20px ${withAlpha(tint, 0.35)}`,
            transition: 'box-shadow 400ms ease',
          }}
        >
          {identity.initial}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black uppercase leading-none tracking-tight">
            {identity.name}, {identity.age}
          </p>
          <p className="mt-1 text-[11px] font-bold leading-none" style={{ color: '#FBBF24' }}>
            C&apos;est un 10, mais…
          </p>
        </div>

        {/* La note vit sur la personne, pas dans un coin de l'écran. */}
        <div
          className="shrink-0 rounded-xl px-2.5 py-1.5 text-center"
          style={{
            background: withAlpha(tint, 0.15),
            border: `1.5px solid ${withAlpha(tint, 0.5)}`,
            transition: 'background-color 200ms ease, border-color 200ms ease',
          }}
        >
          <span className="text-lg font-black leading-none tabular-nums" style={{ color: tint }}>
            {draft}
          </span>
          <span className="text-[10px] font-black text-white/30">/10</span>
        </div>
      </div>

      {/* ── Révélations ──────────────────────────────────────────────────── */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {past.map((stmt, i) => (
          <div key={stmt.id}>
            {i > 0 && <Connector word={connectorFor(past[i - 1].type, stmt.type)} muted />}
            <PastTrait stmt={stmt} score={ratings[i]} />
          </div>
        ))}

        {current && (
          <>
            {past.length > 0 && (
              <Connector word={connectorFor(past[past.length - 1].type, current.type)} />
            )}
            {/* Pas d'AnimatePresence ici : elle maintiendrait l'ancienne
                révélation montée le temps de sa sortie, alors que `past` la rend
                déjà juste au-dessus — la même phrase apparaissait deux fois
                pendant une demi-seconde. Le changement de clé suffit à rejouer
                l'animation d'entrée, sans fantôme. */}
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <CurrentTrait stmt={current} flash={flash} />
            </motion.div>
          </>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}

/** « ET » / « MAIS » sur un rail vertical : la liste se lit comme une phrase. */
function Connector({ word, muted = false }: { word: 'ET' | 'MAIS'; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5 pl-3">
      <span className="h-4 w-px" style={{ background: 'rgba(245,158,11,0.3)' }} />
      <span
        className="text-[10px] font-black uppercase tracking-[0.2em]"
        style={{ color: muted ? 'rgba(245,158,11,0.42)' : '#F59E0B' }}
      >
        {word}
      </span>
    </div>
  );
}

function PastTrait({ stmt, score }: { stmt: DixMaisStatement; score: number }) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      <span className="mt-px shrink-0 text-xs">{stmt.type === 'positive' ? '🟢' : '🚩'}</span>
      <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white/45">
        {stmt.text}
      </p>
      <span
        className="mt-px shrink-0 text-[11px] font-black tabular-nums"
        style={{ color: withAlpha(scoreColor(score), 0.75) }}
      >
        {score}
      </span>
    </div>
  );
}

function CurrentTrait({ stmt, flash }: { stmt: DixMaisStatement; flash: Flash | null }) {
  const positive = stmt.type === 'positive';
  const accent = positive ? '#22C55E' : '#F59E0B';

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-3.5"
      style={{
        background: withAlpha(accent, 0.1),
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 text-base leading-tight">{positive ? '🟢' : '🚩'}</span>
        <p
          className="min-w-0 flex-1 font-black leading-snug text-white"
          style={{ fontSize: 'clamp(1.05rem, 5.2vw, 1.4rem)' }}
        >
          {stmt.text}
        </p>
      </div>

      {/* Bilan du coup : ancienne note → nouvelle, avec l'écart. */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center gap-3"
            style={{ background: 'rgba(7,7,10,0.93)' }}
          >
            <span className="text-3xl font-black tabular-nums text-white/25 line-through">
              {flash.from}
            </span>
            <span className="text-xl text-white/25">→</span>
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="text-5xl font-black leading-none tabular-nums"
              style={{
                color: scoreColor(flash.to),
                textShadow: `0 0 34px ${withAlpha(scoreColor(flash.to), 0.6)}`,
              }}
            >
              {flash.to}
            </motion.span>
            {flash.delta !== 0 && (
              <span
                className="text-base font-black tabular-nums"
                style={{ color: scoreColor(flash.to) }}
              >
                {formatDelta(flash.delta)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
