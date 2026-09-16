import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProfileStep } from '../ProfileStep';

/**
 * Les deux questions ont d'abord été posées sur l'accueil, dans la zone
 * défilante : sur un téléphone il fallait faire défiler pour les trouver,
 * pendant que le bouton du bas en réclamait la réponse. Elles ont maintenant
 * leur écran, atteint en appuyant sur « Jouer ».
 */
describe('ProfileStep', () => {
  it('pose les deux questions d’emblée, sans rien à faire défiler', () => {
    render(<ProfileStep onSubmit={vi.fn()} />);

    expect(screen.getByText('Tu es qui ?')).toBeInTheDocument();
    expect(screen.getByText('Tu es…')).toBeInTheDocument();
    expect(screen.getByText('Tu as…')).toBeInTheDocument();
    for (const libelle of ['Homme', 'Femme', 'Autre', '16-18', '19-22', '23-26', '27+']) {
      expect(screen.getByRole('button', { name: new RegExp(libelle) })).toBeInTheDocument();
    }
  });

  it('retient le départ tant qu’une des deux réponses manque', () => {
    const onSubmit = vi.fn();
    render(<ProfileStep onSubmit={onSubmit} />);

    const bouton = screen.getByRole('button', { name: /Choisis les deux/ });
    expect(bouton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Femme/ }));
    expect(screen.getByRole('button', { name: /Choisis les deux/ })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('laisse partir une fois les deux réponses posées', () => {
    const onSubmit = vi.fn();
    render(<ProfileStep onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Femme/ }));
    fireEvent.click(screen.getByRole('button', { name: /19-22/ }));

    const partir = screen.getByRole('button', { name: /C'est parti/ });
    expect(partir).toBeEnabled();
    fireEvent.click(partir);
    expect(onSubmit).toHaveBeenCalledWith({ sex: 'femme', age: '19-22' });
  });

  // Un bouton, et non un départ automatique au second appui : le profil vaut
  // pour tout le site, une pastille touchée par erreur serait enregistrée pour
  // de bon.
  //
  // Délai relevé : cinq appuis successifs redessinent l'écran cinq fois, et la
  // suite complète tourne sur soixante-dix fichiers en parallèle. Le test passe
  // en trois secondes isolément et dépassait les cinq secondes par défaut sous
  // charge — c'est la machine qui est lente, pas l'écran.
  it('laisse corriger une réponse avant de partir', () => {
    const onSubmit = vi.fn();
    render(<ProfileStep onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Homme/ }));
    fireEvent.click(screen.getByRole('button', { name: /27\+/ }));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Femme/ }));
    fireEvent.click(screen.getByRole('button', { name: /23-26/ }));
    fireEvent.click(screen.getByRole('button', { name: /C'est parti/ }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ sex: 'femme', age: '23-26' });
  }, 20000);
});
