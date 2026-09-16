import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Intro } from '../Intro';

/**
 * Le profil est demandé avant la première note, et non dans le rapport.
 * Chaque vote part avec lui : demandé à la fin, il arrivait après une dizaine
 * de votes déjà enregistrés sans, c'est-à-dire après l'essentiel de ce que
 * joue quelqu'un qui ne fait qu'une partie.
 */
describe('Intro — profil avant la première note', () => {
  it('demande le profil et retient le départ tant qu’il manque', () => {
    const onStart = vi.fn();
    render(
      <Intro onStart={onStart} failed={false} profile={null} profileChecked onProfile={vi.fn()} />,
    );

    const bouton = screen.getByRole('button', { name: /Réponds aux deux questions/ });
    expect(bouton).toBeDisabled();

    fireEvent.click(bouton);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('remonte le profil dès que les deux réponses sont posées', () => {
    const onProfile = vi.fn();
    render(
      <Intro onStart={vi.fn()} failed={false} profile={null} profileChecked onProfile={onProfile} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Femme' }));
    expect(onProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '19-22' }));
    expect(onProfile).toHaveBeenCalledWith({ sex: 'femme', age: '19-22' });
  });

  it('ne demande rien à qui a déjà répondu ailleurs sur le site', () => {
    const onStart = vi.fn();
    render(
      <Intro
        onStart={onStart}
        failed={false}
        profile={{ sex: 'homme', age: '23-26' }}
        profileChecked
        onProfile={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Femme' })).not.toBeInTheDocument();

    const jouer = screen.getByRole('button', { name: 'Jouer' });
    expect(jouer).toBeEnabled();
    fireEvent.click(jouer);
    expect(onStart).toHaveBeenCalled();
  });

  // L'enregistrement local se lit dans un effet, donc après la première
  // peinture : montrer le questionnaire avant de savoir le ferait apparaître
  // puis disparaître chez tous ceux qui ont déjà un profil.
  it('n’affiche rien tant que l’enregistrement local n’a pas été lu', () => {
    render(
      <Intro
        onStart={vi.fn()}
        failed={false}
        profile={null}
        profileChecked={false}
        onProfile={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Femme' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Réponds aux deux questions/)).not.toBeInTheDocument();
    // Le bouton reste inerte : on ne peut pas partir sans savoir.
    expect(screen.getByRole('button', { name: 'Jouer' })).toBeDisabled();
  });

  it('propose de réessayer après un échec de chargement', () => {
    render(
      <Intro
        onStart={vi.fn()}
        failed
        profile={{ sex: 'autre', age: '27+' }}
        profileChecked
        onProfile={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeEnabled();
    expect(screen.getByText(/Connexion impossible/)).toBeInTheDocument();
  });
});
