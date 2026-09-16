import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Intro } from '../Intro';

/**
 * L'accueil ne demande plus rien et ne se désactive plus.
 *
 * Sexe et âge y ont été posés un temps, sous la démonstration animée —
 * c'est-à-dire dans la zone défilante : il fallait faire défiler pour les
 * trouver pendant que le bouton du bas en réclamait la réponse. Ils ont
 * maintenant leur propre écran, derrière « Jouer ».
 */
describe('Intro', () => {
  it('ne pose aucune question et laisse partir tout de suite', () => {
    const onStart = vi.fn();
    render(<Intro onStart={onStart} failed={false} />);

    expect(screen.queryByRole('button', { name: /Femme/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Réponds aux deux questions/)).not.toBeInTheDocument();

    const jouer = screen.getByRole('button', { name: 'Jouer' });
    expect(jouer).toBeEnabled();
    fireEvent.click(jouer);
    expect(onStart).toHaveBeenCalled();
  });

  it('propose de réessayer après un échec de chargement', () => {
    render(<Intro onStart={vi.fn()} failed />);

    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeEnabled();
    expect(screen.getByText(/Connexion impossible/)).toBeInTheDocument();
  });
});
