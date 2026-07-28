'use client';

/**
 * @module dixmais/Verdict
 * Fin de manche.
 *
 * L'ancien écran affichait trois compteurs (nombre d'infos, minimum, moyenne)
 * et s'arrêtait là. On y trouve maintenant trois choses qui manquaient : une
 * **fin nommée** tirée de la trajectoire, la **courbe de la chute** — qui
 * explique rétroactivement la mécanique à ceux qui ne l'avaient pas saisie —, et
 * la **comparaison avec les autres joueurs**, calculée à partir des compteurs
 * déjà transportés par les phrases (aucun appel réseau supplémentaire).
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Share2, Check } from 'lucide-react';
import type { DixMaisStatement } from '@/types/database';
import type { ProfileIdentity } from './profile';
import { START_SCORE, scoreColor, scoreLabel, withAlpha } from './scale';
import { computeEnding, readCommunityStat, readTrajectory, severityLine } from './endings';

const SHARE_URL = 'https://redorgreen.fr/dixmais';

/** Décimales à la française, signe explicite pour les écarts. */
function fr(n: number, digits = 1): string {
  return n.toFixed(digits).replace('.', ',');
}
function signed(n: number, digits = 1): string {
  return n > 0 ? `+${fr(n, digits)}` : fr(n, digits);
}

interface Props {
  identity: ProfileIdentity;
  statements: DixMaisStatement[];
  ratings: number[];
  profileNumber: number;
  onNext: () => void;
}

export function Verdict({ identity, statements, ratings, profileNumber, onNext }: Props) {
  const [copied, setCopied] = useState(false);

  const traj = readTrajectory(ratings);
  // L'élimination interrompt la manche : les phrases non jouées sont exclues.
  const played = statements.slice(0, ratings.length);
  const ending = computeEnding(traj, played.map((s) => s.text));
  const tint = scoreColor(traj.final);

  const deltas = ratings.map((r, i) => r - (i === 0 ? START_SCORE : ratings[i - 1]));
  const community = played.map(readCommunityStat);
  const severity = severityLine(deltas, community.map((c) => c.avgDelta));

  useEffect(() => {
    if (ending.tone !== 'triumphant') return;
    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) return;
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.35 },
          colors: ['#FFD700', '#F59E0B', '#22C55E'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ending.tone]);

  const share = async () => {
    const text = `${identity.name}, ${identity.age} finit à ${traj.final}/10 — « ${ending.title} ». Et toi, tu lui mets combien ?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "C'est un 10 mais…", text, url: SHARE_URL });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* partage annulé ou indisponible */
    }
  };

  return (
    <motion.div
      key="verdict"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="scrollbar-hide flex flex-1 flex-col overflow-y-auto px-5 pb-8"
    >
      {/* ── Note finale ──────────────────────────────────────────────────── */}
      <motion.div
        className="pt-2 text-center"
        animate={ending.tone === 'brutal' ? { x: [0, -7, 6, -4, 0] } : undefined}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Profil #{profileNumber} · {identity.name}, {identity.age}
        </p>
        <motion.p
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 230, damping: 17, delay: 0.08 }}
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 'clamp(4.5rem, 24vw, 8rem)',
            color: tint,
            letterSpacing: '-0.05em',
            textShadow: `0 0 70px ${withAlpha(tint, 0.4)}`,
          }}
        >
          {traj.final}
        </motion.p>
        <p className="text-sm font-black uppercase tracking-wide" style={{ color: tint }}>
          {scoreLabel(traj.final)}
        </p>
      </motion.div>

      {/* ── La fin ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-5 rounded-2xl px-4 py-4 text-center"
        style={{ background: withAlpha(tint, 0.09), border: `1px solid ${withAlpha(tint, 0.28)}` }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Ta fin</p>
        <p
          className="mt-1 font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(1.6rem, 8vw, 2.2rem)', color: tint }}
        >
          {ending.title}
        </p>
        <p className="mt-2 text-[13px] font-semibold leading-snug text-white/65">
          {ending.subtitle}
        </p>
      </motion.div>

      {/* ── La chute ─────────────────────────────────────────────────────── */}
      <p className="mt-6 mb-2 text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
        Sa descente
      </p>
      <TrajectoryChart path={traj.path} tint={tint} />

      {/* ── Détail par révélation ────────────────────────────────────────── */}
      <p className="mt-6 mb-2 text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
        Ce que chaque info lui a coûté
      </p>

      <div className="flex flex-col gap-1.5">
        {played.map((stmt, i) => {
          const { avgDelta, eliminationRate } = community[i];
          return (
            <div
              key={stmt.id}
              className="rounded-xl px-3.5 py-2.5"
              style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-px shrink-0 text-xs">
                  {stmt.type === 'positive' ? '🟢' : '🚩'}
                </span>
                <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white/75">
                  {stmt.text}
                </p>
                <span
                  className="shrink-0 text-sm font-black tabular-nums"
                  style={{ color: scoreColor(ratings[i]) }}
                >
                  {deltas[i] === 0 ? '=' : signed(deltas[i], 0)}
                </span>
              </div>

              {avgDelta !== null && (
                <p className="mt-1.5 pl-6 text-[10px] font-bold text-white/35">
                  Les autres : {signed(avgDelta)}
                  {eliminationRate !== null && eliminationRate >= 5 && (
                    <>
                      {' · '}
                      <span className="text-red-400/70">
                        {Math.round(eliminationRate)}% éliminent ici
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {severity && (
        <p className="mt-3 text-center text-[11px] font-bold" style={{ color: withAlpha(tint, 0.8) }}>
          {severity}
        </p>
      )}

      {/* ── Suite ────────────────────────────────────────────────────────── */}
      <div className="mt-6 space-y-2">
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
            onClick={share}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest text-white/70"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied ? 'Copié' : 'Partager'}
          </button>
          <Link
            href="/dixmais/leaderboard"
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-black uppercase tracking-widest"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.22)',
              color: '#F59E0B',
            }}
          >
            <Trophy size={13} /> Classement
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Courbe de la note, du 10 initial à la note finale.
 * C'est la preuve visuelle que les notes s'enchaînaient : le joueur qui n'avait
 * pas compris la mécanique la voit ici d'un coup d'œil.
 */
function TrajectoryChart({ path, tint }: { path: number[]; tint: string }) {
  const W = 320;
  const H = 96;
  const PAD_X = 14;
  const PAD_Y = 12;

  const x = (i: number) =>
    path.length <= 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (path.length - 1);
  const y = (score: number) => PAD_Y + ((START_SCORE - score) / START_SCORE) * (H - PAD_Y * 2);

  const line = path.map((s, i) => `${x(i)},${y(s)}`).join(' ');
  const area = `${PAD_X},${H - PAD_Y} ${line} ${x(path.length - 1)},${H - PAD_Y}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Évolution de la note">
      <defs>
        <linearGradient id="dixmais-fall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.28" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Repères 10 / 5 / 0 */}
      {[10, 5, 0].map((s) => (
        <line
          key={s}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y(s)}
          y2={y(s)}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      <polygon points={area} fill="url(#dixmais-fall)" />
      <polyline
        points={line}
        fill="none"
        stroke={tint}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {path.map((s, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(s)}
          r={i === path.length - 1 ? 5 : 3}
          fill={i === 0 ? '#FFD700' : scoreColor(s)}
          stroke="#07070A"
          strokeWidth="2"
        />
      ))}

      <text x={PAD_X} y={y(10) - 4} fill="#FFD700" fontSize="10" fontWeight="800">
        10
      </text>
      <text
        x={W - PAD_X}
        y={y(path[path.length - 1]) - 9}
        fill={tint}
        fontSize="13"
        fontWeight="900"
        textAnchor="end"
      >
        {path[path.length - 1]}
      </text>
    </svg>
  );
}
