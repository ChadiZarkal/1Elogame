import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReportScreen } from '../ReportScreen';
import { Verdict } from '../Verdict';
import { FIN_TEST, profilJuge } from './fixtures';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Verdict', () => {
  it('donne au profil la moyenne de ses cinq notes', () => {
    const profil = profilJuge([2, 5, 8, 10, 7], { nom: 'Emma' });
    render(<Verdict profil={profil} sessionCount={1} onNext={vi.fn()} onReport={vi.fn()} loadFailed={false} />);

    expect(screen.getByLabelText('Moyenne 6,4 sur 10')).toBeInTheDocument();
    expect(screen.getByText(FIN_TEST.title)).toBeInTheDocument();
    expect(screen.getByText('Tes 5 notes')).toBeInTheDocument();
    // Le red flag le plus lourd est signalé avec ce qu'il coûte.
    expect(screen.getByText(/lui coûte 1,1 point de moyenne/)).toBeInTheDocument();
  });

  it('oppose la moyenne des autres quand elle est mesurable', () => {
    const profil = profilJuge([2, 2, 2, 2, 2], { communaute: [6, 6, 6, 6, 6] });
    render(<Verdict profil={profil} sessionCount={1} onNext={vi.fn()} onReport={vi.fn()} loadFailed={false} />);

    expect(screen.getByText('Les autres')).toBeInTheDocument();
    expect(screen.getByText(/4 points plus dur que les autres avec Lucas/)).toBeInTheDocument();
  });

  it('ne propose le bilan qu’à partir du deuxième profil', () => {
    const profil = profilJuge([5, 5, 5, 5, 5]);
    const { rerender } = render(
      <Verdict profil={profil} sessionCount={1} onNext={vi.fn()} onReport={vi.fn()} loadFailed={false} />,
    );
    expect(screen.queryByText(/Mon bilan/)).not.toBeInTheDocument();

    rerender(<Verdict profil={profil} sessionCount={2} onNext={vi.fn()} onReport={vi.fn()} loadFailed={false} />);
    expect(screen.getByText(/Mon bilan · 2 profils/)).toBeInTheDocument();
  });
});

describe('ReportScreen', () => {
  const soiree = [
    profilJuge([4, 4, 4, 4, 4], { nom: 'Lucas', numero: 1 }),
    profilJuge([9, 8, 9, 8, 9], { nom: 'Emma', numero: 2, fin: { ...FIN_TEST, key: 'bon-parti', title: 'BON PARTI' } }),
    profilJuge([0, 6, 6, 6, 6], { nom: 'Hugo', numero: 3 }),
  ];

  it('affiche le portrait, les compteurs et le classement de la soirée', () => {
    render(<ReportScreen rounds={soiree} profile={null} onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText(/3 profils · 15 red flags/)).toBeInTheDocument();
    expect(screen.getByText('Ton classement')).toBeInTheDocument();
    const lignes = screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(lignes[0]).toContain('Emma');
    expect(lignes[0]).toContain('8,6');
    expect(lignes[1]).toContain('Hugo');
    expect(lignes[2]).toContain('Lucas');
    expect(screen.getByText('BON PARTI')).toBeInTheDocument();
  });

  it('liste les rédhibitoires', () => {
    render(<ReportScreen rounds={soiree} profile={null} onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText('Tes rédhibitoires')).toBeInTheDocument();
    expect(screen.getByText('Red flag numéro 1 de Hugo')).toBeInTheDocument();
  });

  it('dit en clair que le joueur est plus sévère que la moyenne', () => {
    const dur = [
      profilJuge([2, 2, 2, 2, 2], { communaute: [7, 7, 7, 7, 7], nom: 'A' }),
      profilJuge([3, 3, 3, 3, 3], { communaute: [7, 7, 7, 7, 7], nom: 'B', numero: 2 }),
    ];
    render(<ReportScreen rounds={dur} profile={null} onBack={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText(/extrêmement sévère/)).toBeInTheDocument();
  });

  it('compare à la cohorte quand la base répond', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `s${i}`);
    const rounds = [
      profilJuge([2, 2, 2, 2, 2], { ids: ids.slice(0, 5), nom: 'A' }),
      profilJuge([2, 2, 2, 2, 2], { ids: ids.slice(5), nom: 'B', numero: 2 }),
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            data: ids.map((id) => ({ statement_id: id, votes: 5, avg_delta: -2, elimination_rate: 5 })),
          }),
        }),
      ),
    );

    render(
      <ReportScreen rounds={rounds} profile={{ sex: 'femme', age: '19-22' }} onBack={vi.fn()} onNext={vi.fn()} />,
    );
    await waitFor(() => expect(screen.getByText('Face aux femmes de 19-22 ans')).toBeInTheDocument());
    expect(screen.getByText(/extrêmement sévère par rapport aux femmes de 19-22 ans/)).toBeInTheDocument();
  });
});
