import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportScreen } from '../ReportScreen';
import { Verdict } from '../Verdict';
import type { Ending } from '../endings';
import type { PlayedRound } from '../report';

const FIN: Ending = {
  key: 'couperet',
  title: 'LE COUPERET',
  subtitle: 'Et c’était terminé.',
  tone: 'brutal',
};

function manche(
  ratings: number[],
  options: {
    community?: (number | null)[];
    communityElim?: (number | null)[];
    types?: ('positive' | 'negative')[];
    categories?: string[];
    name?: string;
    numero?: number;
    ending?: Ending;
  } = {},
): PlayedRound {
  const played = ratings.map((_, i) => ({
    id: `${options.name ?? 'x'}-${i}`,
    text: `Révélation numéro ${i + 1}`,
    type: options.types?.[i] ?? ('negative' as const),
    category: options.categories?.[i] ?? 'politique',
  }));

  return {
    profileNumber: options.numero ?? 1,
    name: options.name ?? 'Lucas',
    age: 24,
    played,
    ratings,
    deltas: ratings.map((r, i) => r - (i === 0 ? 10 : ratings[i - 1])),
    community: options.community ?? played.map(() => -1),
    communityElim: options.communityElim ?? played.map(() => 12),
    final: ratings.at(-1) ?? 10,
    eliminated: ratings.at(-1) === 0,
    ending: options.ending ?? FIN,
  };
}

describe('ReportScreen', () => {
  const soiree = [
    manche([6, 2], { name: 'Lucas', numero: 1 }),
    manche([5, 0], { name: 'Emma', numero: 2, ending: { ...FIN, key: 'trappe', title: 'LA TRAPPE' } }),
    manche([8, 7, 7], {
      name: 'Hugo',
      numero: 3,
      types: ['negative', 'positive', 'negative'],
      categories: ['politique', 'dating', 'dating'],
      ending: { ...FIN, key: 'tiede', title: 'LE GRAND TIÈDE', tone: 'neutral' },
    }),
  ];

  it('affiche le portrait, les compteurs et la frise des verdicts', () => {
    render(<ReportScreen rounds={soiree} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText(/3 profils · 7 révélations/)).toBeInTheDocument();
    // Un seul profil éliminé sur les trois.
    expect(screen.getByText('Éliminés')).toBeInTheDocument();
    // La frise reprend chaque verdict de la session.
    expect(screen.getByText('LA TRAPPE')).toBeInTheDocument();
    expect(screen.getByText('LE GRAND TIÈDE')).toBeInTheDocument();
    expect(screen.getByText('Hugo')).toBeInTheDocument();
  });

  it('dit en clair que le joueur est plus sévère que la moyenne', () => {
    // Le joueur retire beaucoup, la communauté presque rien.
    const dur = [
      manche([5, 1], { community: [-1, -1] }),
      manche([5, 1], { community: [-1, -1] }),
    ];
    render(<ReportScreen rounds={dur} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText(/extrêmement sévère/)).toBeInTheDocument();
    expect(screen.getByText('Ta sévérité')).toBeInTheDocument();
    expect(screen.getByText(/Mesuré sur 4 révélations/)).toBeInTheDocument();
  });

  it('dit en clair que le joueur est plus indulgent que la moyenne', () => {
    const tendre = [
      manche([10, 10], { community: [-3, -3] }),
      manche([10, 10], { community: [-3, -3] }),
    ];
    render(<ReportScreen rounds={tendre} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText(/aussi gentil que toi/)).toBeInTheDocument();
  });

  // Sur une session trop courte, une sévérité calculée sur deux révélations
  // serait du bruit présenté comme un verdict.
  it('masque les blocs dont la donnée manque plutôt que d’afficher un tiret', () => {
    const court = [manche([8, 6], { community: [null, null], communityElim: [null, null] })];
    render(<ReportScreen rounds={court} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.queryByText('Ta sévérité')).not.toBeInTheDocument();
    expect(screen.queryByText('Ta gâchette')).not.toBeInTheDocument();
    // Le portrait et les compteurs, eux, tiennent toujours.
    expect(screen.getByText('Jugés')).toBeInTheDocument();
  });

  it('nomme la catégorie qui fait le plus mal', () => {
    const rounds = [
      manche([6, 2, 1, 1], {
        categories: ['politique', 'politique', 'dating', 'dating'],
        community: [-1, -1, -1, -1],
      }),
    ];
    render(<ReportScreen rounds={rounds} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText('Ce qui te fait décrocher')).toBeInTheDocument();
    expect(screen.getByText(/La politique te coûte/)).toBeInTheDocument();
  });
});

describe('Verdict — accès au rapport', () => {
  it('cache le rapport sur le premier profil', () => {
    render(
      <Verdict
        round={manche([6, 2])}
        sessionCount={1}
        onNext={vi.fn()}
        onReport={vi.fn()}
        loadFailed={false}
      />,
    );
    expect(screen.queryByText(/Mon rapport/)).not.toBeInTheDocument();
  });

  it('propose le rapport dès le deuxième, et annonce le nombre de profils', () => {
    const onReport = vi.fn();
    render(
      <Verdict
        round={manche([6, 2])}
        sessionCount={4}
        onNext={vi.fn()}
        onReport={onReport}
        loadFailed={false}
      />,
    );

    const bouton = screen.getByText(/Mon rapport · 4 profils/);
    expect(bouton).toBeInTheDocument();
    bouton.click();
    expect(onReport).toHaveBeenCalled();
  });

  it('affiche la fin décidée par le jeu, sans la recalculer', () => {
    render(
      <Verdict
        round={manche([6, 0], { ending: { ...FIN, key: 'seul-au-monde', title: 'TU ES SEUL AU MONDE' } })}
        sessionCount={2}
        onNext={vi.fn()}
        onReport={vi.fn()}
        loadFailed={false}
      />,
    );
    expect(screen.getByText('TU ES SEUL AU MONDE')).toBeInTheDocument();
  });
});
