'use client';

/**
 * @module admin/dashboard
 * Tableau de bord — la croissance, et rien d'autre.
 *
 * L'ancienne version alignait des totaux : nombre d'éléments, nombre de votes
 * depuis toujours, meilleur élément du classement. Des nombres qui ne peuvent
 * que monter, et qui montent même quand l'activité s'effondre — ils ne
 * répondaient à aucune question qu'on se pose vraiment.
 *
 * Tout ici est une série ou une comparaison de périodes :
 *   · l'activité par jour, lissée sur sept jours, sur six mois ;
 *   · les sept derniers jours contre les sept précédents ;
 *   · les semaines calendaires et les mois, chacun comparé au précédent.
 *
 * Sept jours de lissage parce que c'est exactement un cycle hebdomadaire : sans
 * cela, on lit le samedi et le mardi plutôt que la tendance.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { AdminNav } from '@/components/admin/AdminNav';
import {
  byMonth,
  byWeek,
  formatMoyenne,
  formatVariation,
  summarize,
  trendLine,
  valuesOf,
  SOURCE_LABELS,
  type Bucket,
  type DailyPoint,
  type SourceKey,
} from '@/lib/growth';

const SOURCES: SourceKey[] = ['votes', 'dixmais', 'oracle', 'sessions'];

const TEINTES: Record<SourceKey, string> = {
  votes: '#DC2626',
  dixmais: '#F59E0B',
  oracle: '#8B5CF6',
  sessions: '#10B981',
};

const FENETRES = [
  { jours: 90, label: '3 mois' },
  { jours: 180, label: '6 mois' },
  { jours: 365, label: '1 an' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [points, setPoints] = useState<DailyPoint[] | null>(null);
  const [jours, setJours] = useState(180);
  const [source, setSource] = useState<SourceKey>('votes');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async (token: string, fenetre: number) => {
    setChargement(true);
    setErreur('');
    try {
      const res = await fetch(`/api/admin/growth?jours=${fenetre}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }
      const json = await res.json();
      if (!json.success) {
        setErreur(json.error?.message ?? 'Chargement impossible');
        return;
      }
      setPoints(json.data.points);
    } catch {
      setErreur('Erreur réseau');
    } finally {
      setChargement(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    charger(token, jours);
  }, [router, charger, jours]);

  const resumes = useMemo(
    () => (points ? SOURCES.map((s) => summarize(points, s)) : []),
    [points],
  );
  const semaines = useMemo(
    () => (points ? byWeek(points, source).slice(-12) : []),
    [points, source],
  );
  const mois = useMemo(
    () => (points ? byMonth(points, source) : []),
    [points, source],
  );

  if (chargement && !points) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <Loading size="lg" text="Chargement…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D0D]">
      <AdminNav />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5F5] sm:text-3xl">Croissance</h1>
              <p className="mt-1 text-sm text-[#737373]">
                Activité lissée sur {SMOOTHING_LABEL}. Chaque période est comparée à la précédente.
              </p>
            </div>
            <div className="flex gap-1.5">
              {FENETRES.map((f) => (
                <button
                  key={f.jours}
                  onClick={() => setJours(f.jours)}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                  style={{
                    background: jours === f.jours ? '#DC2626' : 'rgba(255,255,255,0.05)',
                    color: jours === f.jours ? '#fff' : '#A3A3A3',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {erreur && (
            <div className="mb-6 rounded-xl border border-[#DC2626]/50 bg-[#991B1B]/20 p-4 text-[#FCA5A5]">
              {erreur}
            </div>
          )}

          {/* ── Le rythme actuel, par source ─────────────────────────────── */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resumes.map((r) => (
              <button
                key={r.source}
                onClick={() => setSource(r.source)}
                className="cursor-pointer rounded-xl border p-4 text-left transition-colors"
                style={{
                  background: source === r.source ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  borderColor: source === r.source ? TEINTES[r.source] : 'rgba(255,255,255,0.08)',
                }}
              >
                <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  {SOURCE_LABELS[r.source]}
                </p>
                <p className="mt-2 text-2xl font-black tabular-nums" style={{ color: TEINTES[r.source] }}>
                  {formatMoyenne(r.parJour7)}
                  <span className="ml-1 text-xs font-bold text-[#737373]">/ jour</span>
                </p>
                <div className="mt-2 flex items-baseline gap-3 text-[11px] font-bold">
                  <Variation valeur={r.variation7} legende="7 j" />
                  <Variation valeur={r.variation30} legende="30 j" />
                </div>
              </button>
            ))}
          </div>

          {/* ── La courbe ────────────────────────────────────────────────── */}
          <section className="mb-6 rounded-xl border border-white/8 bg-white/3 p-4">
            <h2 className="mb-1 text-sm font-bold text-[#F5F5F5]">
              {SOURCE_LABELS[source]} — par jour
            </h2>
            <p className="mb-4 text-xs text-[#737373]">
              Barres : le compte brut de chaque journée. Ligne : la moyenne des sept derniers jours.
              La journée en cours est écartée des moyennes — elle n&apos;est pas finie.
            </p>
            {points && <CourbeQuotidienne points={points} source={source} teinte={TEINTES[source]} />}
          </section>

          {/* ── Semaines et mois ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Periodes
              titre="Par semaine"
              sousTitre="Semaines calendaires, du lundi au dimanche"
              buckets={semaines}
              teinte={TEINTES[source]}
            />
            <Periodes
              titre="Par mois"
              sousTitre="Mois calendaires"
              buckets={mois}
              teinte={TEINTES[source]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

const SMOOTHING_LABEL = 'sept jours';

// ---------------------------------------------------------------------------
// Briques
// ---------------------------------------------------------------------------

function Variation({ valeur, legende }: { valeur: number | null; legende: string }) {
  const couleur =
    valeur === null ? '#737373' : valeur > 0 ? '#10B981' : valeur < 0 ? '#EF4444' : '#A3A3A3';
  return (
    <span className="flex items-baseline gap-1">
      <span style={{ color: couleur }}>{formatVariation(valeur)}</span>
      <span className="text-[10px] text-[#525252]">{legende}</span>
    </span>
  );
}

/**
 * Barres quotidiennes et moyenne glissante, dessinées à la main.
 *
 * Le projet n'embarque aucune bibliothèque de graphiques, et en ajouter une
 * pour deux courbes coûterait plus lourd que la page entière.
 */
function CourbeQuotidienne({
  points, source, teinte,
}: { points: DailyPoint[]; source: SourceKey; teinte: string }) {
  const valeurs = valuesOf(points, source);
  const moyenne = trendLine(valeurs);
  const max = Math.max(1, ...valeurs);

  const W = 1000;
  const H = 220;
  const PAD_B = 22;
  const PAD_T = 8;
  const largeurBarre = W / Math.max(valeurs.length, 1);

  const y = (v: number) => PAD_T + (1 - v / max) * (H - PAD_T - PAD_B);

  const ligne = moyenne
    .map((v, i) => (v === null ? null : `${i * largeurBarre + largeurBarre / 2},${y(v)}`))
    .filter((p): p is string => p !== null)
    .join(' ');

  // Un repère tous les trente jours : assez pour situer, assez peu pour rester
  // lisible sur un an.
  const reperes = points
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i % 30 === 0 || i === points.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Activité quotidienne — ${SOURCE_LABELS[source]}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={0} x2={W} y1={y(max * f)} y2={y(max * f)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={4} y={y(max * f) - 3} fill="#525252" fontSize="10">{Math.round(max * f)}</text>
        </g>
      ))}

      {valeurs.map((v, i) => (
        <rect
          key={i}
          x={i * largeurBarre}
          y={y(v)}
          width={Math.max(largeurBarre - 0.5, 0.5)}
          height={Math.max(0, H - PAD_B - y(v))}
          fill={teinte}
          opacity={0.28}
        />
      ))}

      {ligne && (
        <polyline points={ligne} fill="none" stroke={teinte} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}

      {reperes.map(({ p, i }) => (
        <text
          key={p.jour}
          x={Math.min(W - 30, i * largeurBarre)}
          y={H - 6}
          fill="#525252"
          fontSize="10"
        >
          {p.jour.slice(8, 10)}/{p.jour.slice(5, 7)}
        </text>
      ))}
    </svg>
  );
}

function Periodes({
  titre, sousTitre, buckets, teinte,
}: { titre: string; sousTitre: string; buckets: Bucket[]; teinte: string }) {
  const max = Math.max(1, ...buckets.map((b) => b.total));

  return (
    <section className="rounded-xl border border-white/8 bg-white/3 p-4">
      <h2 className="text-sm font-bold text-[#F5F5F5]">{titre}</h2>
      <p className="mb-3 text-xs text-[#737373]">{sousTitre}</p>

      <div className="flex flex-col gap-1.5">
        {buckets.map((b) => (
          <div key={b.debut} className="flex items-center gap-3">
            <span className="w-[68px] shrink-0 truncate text-[11px] font-bold text-[#A3A3A3]">
              {b.label}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded bg-white/5">
              <div
                className="h-full rounded"
                style={{
                  width: `${(b.total / max) * 100}%`,
                  background: teinte,
                  /* La période en cours est incomplète : la montrer pleine
                     ferait croire à une chute chaque lundi matin. */
                  opacity: b.enCours ? 0.35 : 0.8,
                }}
              />
            </div>
            <span className="w-[52px] shrink-0 text-right text-xs font-black tabular-nums text-[#F5F5F5]">
              {b.total}
            </span>
            <span className="w-[62px] shrink-0 text-right text-[11px] font-bold">
              {b.enCours ? (
                <span className="text-[#525252]">en cours</span>
              ) : (
                <Variation valeur={b.variation} legende="" />
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
