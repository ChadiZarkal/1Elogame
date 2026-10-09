/**
 * @file stories.test.tsx
 * @description Red Flag Test — le résultat en stories.
 *
 * Trois choses à tenir : un écran sans rien à dire n'est pas affiché, la
 * phrase du classement ne retourne jamais le « Top X % » (les ex aequo ne sont
 * pas des joueurs battus), et un tap sur un bouton du dernier écran ne fait pas
 * changer d'écran.
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Classement, Resultat } from '@/lib/rft/types';
import { Stories } from '@/app/redflagtest/Stories';

function rang(top: number, legende: string): Classement {
  return { top, legende, couleur: top <= 33 ? 'red' : top <= 66 ? 'orange' : 'green', effectif: 500, avertissement: null };
}

function resultat(partiel: Partial<Resultat> = {}): Resultat {
  return {
    score: 68,
    verdict: { id: 'v', minScore: 50, emoji: '🟠', titre: 'ÇA SE VOIT DE LOIN', soustitre: null },
    classements: { tous: rang(23, 'tous'), sexe: rang(31, 'hommes'), age: rang(18, '23-26 ans') },
    axes: [
      { tagId: 'a', label: 'Contrôle', color: null, valeur: 82, points: 41, maximum: 50 },
      { tagId: 'b', label: 'Respect', color: null, valeur: 38, points: 19, maximum: 50 },
    ],
    pointNoir: { tagId: 'a', label: 'Contrôle', color: null, valeur: 82, points: 41, maximum: 50 },
    comparaison: null,
    archetype: { id: 'x', tagA: 'a', tagB: null, emoji: '🕵️', titre: 'LE DÉTECTIVE', soustitre: 'Tu « vérifies ».' },
    reponseDecisive: { question: 'Q ?', reponse: 'Je regarde son téléphone', points: 14 },
    ressources: [],
    highlights: [],
    participants: 500,
    codePartage: 'abc',
    ...partiel,
  };
}

const segments = () => screen.getAllByRole('button', { name: /^Écran \d+ sur \d+/ });

describe('Red Flag Test — stories', () => {
  it('n’affiche que les écrans qui ont quelque chose à dire', () => {
    render(
      <Stories
        idDetail="d"
        resultat={resultat({
          classements: { tous: null, sexe: null, age: null },
          reponseDecisive: null,
        })}
      />,
    );
    // Verdict, catégories, partage : ni classement, ni réponse décisive.
    expect(segments()).toHaveLength(3);
  });

  it('donne son propre écran aux ressources, avant le partage', () => {
    render(
      <Stories
        idDetail="d"
        resultat={resultat({ ressources: [{ label: 'Contrôle', texte: 'Un texte sérieux.', lien: null }] })}
      />,
    );
    const noms = segments().map((s) => s.getAttribute('aria-label'));
    expect(noms.at(-2)).toMatch(/Plus sérieusement/);
    expect(noms.at(-1)).toMatch(/À toi de jouer/);
  });

  it('redit le rang sans le retourner, en haut comme en bas du classement', () => {
    const { unmount } = render(<Stories idDetail="d" resultat={resultat()} />);
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }));
    expect(screen.getByText('Tu es dans les')).toBeDefined();
    expect(screen.getByText('23 %')).toBeDefined();
    unmount();

    render(
      <Stories
        idDetail="d"
        resultat={resultat({ classements: { tous: rang(91, 'tous'), sexe: null, age: null } })}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }));
    expect(screen.getByText('91 %')).toBeDefined();
    expect(screen.getByText(/sont au moins aussi red flag que toi/)).toBeDefined();
    // Jamais le complément, qui compterait les ex aequo comme battus.
    expect(screen.queryByText('9 %')).toBeNull();
  });

  it('laisse les boutons du dernier écran faire leur travail', () => {
    const recommencer = vi.fn();
    render(<Stories idDetail="d" resultat={resultat()} onRecommencer={recommencer} />);
    fireEvent.click(segments().at(-1)!);

    fireEvent.click(screen.getByRole('button', { name: 'Refaire le test' }));
    expect(recommencer).toHaveBeenCalledOnce();
    // Toujours sur le dernier écran.
    expect(segments().at(-1)!.getAttribute('aria-current')).toBe('step');
  });
});
