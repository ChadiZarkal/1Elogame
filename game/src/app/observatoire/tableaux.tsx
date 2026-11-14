/**
 * @module observatoire/tableaux
 * Les tableaux et le chargement des données de l'Observatoire, communs à
 * `/observatoire` et `/en/observatoire`. Le texte éditorial de chaque page vit
 * dans la page elle-même.
 *
 * En français, le rendu est celui qu'écrivait la page avant la traduction
 * (2026-11-14), au caractère près.
 */

import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { getPublicStats } from '@/lib/repositories';
import {
  getObservatoryData,
  type GapEntry,
  type ObservatoryData,
  type SpreadEntry,
} from '@/lib/leaderboard';
import type { Langue } from '@/lib/i18n/langue';

const EMPTY: ObservatoryData = {
  totalElements: 0,
  totalVotes: 0,
  genderGaps: [],
  ageGaps: [],
  mostContested: [],
  mostConsensual: [],
};

export function formatNumber(value: number, langue: Langue = 'fr'): string {
  return value.toLocaleString(langue === 'en' ? 'en-US' : 'fr-FR');
}

/** Les agrégats et le nombre de votes ; des valeurs vides si la base ne répond pas. */
export async function chargerObservatoire(langue: Langue): Promise<{ data: ObservatoryData; votes: number | null }> {
  let data = EMPTY;
  let votes: number | null = null;

  try {
    data = await withPrerenderTimeout(getObservatoryData(12, langue));
  } catch {
    // Base indisponible : la page reste lisible, sans les tableaux.
  }
  try {
    // Le nombre de votes vient de la table des votes. `data.totalVotes` est la
    // somme des participations, qui compte chaque duel deux fois — une par
    // comportement —, et la page annonçait donc le double du réel.
    votes = (await withPrerenderTimeout(getPublicStats())).totalVotes;
  } catch {
    votes = null;
  }

  return { data, votes };
}

export function GapTable({
  entries,
  labelA,
  labelB,
  langue = 'fr',
  parA,
  parB,
}: {
  entries: GapEntry[];
  labelA: string;
  labelB: string;
  langue?: Langue;
  /** En anglais : le groupe le plus sévère, après « rated worse by ». */
  parA?: string;
  parB?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {entries.map((entry) => {
        const harsherA = entry.gap > 0;
        return (
          <div
            key={entry.texte}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <p style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>
              {entry.texte}
            </p>
            {langue === 'fr' ? (
              <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                {labelA} : <strong style={{ color: '#D1D5DB' }}>{entry.scoreA}</strong> ·{' '}
                {labelB} : <strong style={{ color: '#D1D5DB' }}>{entry.scoreB}</strong> ·{' '}
                écart de <strong style={{ color: '#F59E0B' }}>{Math.abs(entry.gap)} points</strong>{' '}
                en faveur de {harsherA ? labelA.toLowerCase() : labelB.toLowerCase()}
              </p>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                {labelA}: <strong style={{ color: '#D1D5DB' }}>{entry.scoreA}</strong> ·{' '}
                {labelB}: <strong style={{ color: '#D1D5DB' }}>{entry.scoreB}</strong> ·{' '}
                a <strong style={{ color: '#F59E0B' }}>{Math.abs(entry.gap)}-point</strong> gap,{' '}
                rated worse by {harsherA ? (parA ?? labelA.toLowerCase()) : (parB ?? labelB.toLowerCase())}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SpreadList({
  entries,
  kind,
  langue = 'fr',
}: {
  entries: SpreadEntry[];
  kind: 'contested' | 'consensual';
  langue?: Langue;
}) {
  const accent = kind === 'contested' ? '#F59E0B' : '#10B981';

  return (
    <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, padding: 0, listStyle: 'none' }}>
      {entries.map((entry) => (
        <li
          key={entry.texte}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: `3px solid ${accent}`,
            borderRadius: 12,
            padding: '14px 18px',
          }}
        >
          <p style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>
            {entry.texte}
          </p>
          {langue === 'fr' ? (
            <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              Amplitude entre groupes :{' '}
              <strong style={{ color: accent }}>{entry.spread} points</strong> · score général{' '}
              {entry.eloGlobal}
            </p>
          ) : (
            <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              Spread across groups:{' '}
              <strong style={{ color: accent }}>{entry.spread} points</strong> · overall score{' '}
              {entry.eloGlobal}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
