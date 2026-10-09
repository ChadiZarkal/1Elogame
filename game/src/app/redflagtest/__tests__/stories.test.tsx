/**
 * @file stories.test.tsx
 * @description Red Flag Test — le résultat en stories plein écran.
 *
 * Ce qu'il faut tenir : un écran sans rien à dire n'est pas affiché ; le
 * classement donne la place exacte et ne compte jamais les ex aequo comme
 * battus ; les moyennes trop minces ne s'affichent pas ; un tap sur un bouton
 * du dernier écran ne fait pas changer d'écran ; la croix referme.
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Classement, Resultat } from '@/lib/rft/types';
import { Stories, placerEtiquettes } from '@/app/redflagtest/Stories';

function rang(position: number, effectif: number, legende: string, moyenne: number | null = 40): Classement {
  const top = Math.ceil((position / effectif) * 100);
  return {
    top, legende, effectif, position, moyenne,
    couleur: top <= 33 ? 'red' : top <= 66 ? 'orange' : 'green',
    avertissement: null,
  };
}

function resultat(partiel: Partial<Resultat> = {}): Resultat {
  return {
    score: 68,
    verdict: { id: 'v', minScore: 50, emoji: '🟠', titre: 'ÇA SE VOIT DE LOIN', soustitre: null },
    classements: {
      tous: rang(47, 512, 'tous', 42),
      sexe: rang(30, 250, 'hommes', 47),
      age: rang(12, 80, '23-26 ans', 36),
    },
    axes: [
      { tagId: 'a', label: 'Contrôle', color: null, valeur: 82, points: 41, maximum: 50 },
      { tagId: 'b', label: 'Respect', color: null, valeur: 38, points: 19, maximum: 50 },
    ],
    pointNoir: { tagId: 'a', label: 'Contrôle', color: null, valeur: 82, points: 41, maximum: 50 },
    comparaison: { cohorte: 'sexe_age', legende: 'des hommes de 23-26 ans', ecart: 18, moyenne: 50, effectif: 40 },
    archetype: { id: 'x', tagA: 'a', tagB: null, emoji: '🕵️', titre: 'LE DÉTECTIVE', soustitre: 'Tu « vérifies ».' },
    reponseDecisive: { question: 'Q ?', reponse: 'Je regarde son téléphone', points: 14 },
    ressources: [],
    highlights: [],
    participants: 512,
    codePartage: 'abc',
    ...partiel,
  };
}

const segments = () => screen.getAllByRole('button', { name: /^Écran \d+ sur \d+/ });
const aller = (titre: RegExp) => fireEvent.click(segments().find((s) => titre.test(s.getAttribute('aria-label') ?? ''))!);

describe('Red Flag Test — stories', () => {
  it('n’affiche que les écrans qui ont quelque chose à dire', () => {
    render(
      <Stories
        onFermer={() => {}}
        resultat={resultat({
          classements: { tous: null, sexe: null, age: null },
          reponseDecisive: null,
        })}
      />,
    );
    // Verdict, catégories, partage : ni moyennes, ni classement, ni réponse.
    expect(segments()).toHaveLength(3);
  });

  it('donne son propre écran aux ressources, avant le partage', () => {
    render(
      <Stories
        onFermer={() => {}}
        resultat={resultat({ ressources: [{ label: 'Contrôle', texte: 'Un texte sérieux.', lien: null }] })}
      />,
    );
    const noms = segments().map((s) => s.getAttribute('aria-label'));
    expect(noms.at(-2)).toMatch(/Plus sérieusement/);
    expect(noms.at(-1)).toMatch(/À toi de jouer/);
  });

  it('donne la place exacte, puis la même place sur cent joueurs', () => {
    render(<Stories onFermer={() => {}} resultat={resultat()} />);
    aller(/Ton classement/);
    expect(screen.getByText('47e')).toBeDefined();
    expect(screen.getByText(/sur 512 joueurs/)).toBeDefined();
    // 46 scores strictement plus hauts sur 512 : 9 sur 100 — les ex aequo
    // restent du côté du joueur.
    expect(screen.getByText('9')).toBeDefined();

    fireEvent.click(screen.getByRole('tab', { name: /Hommes/ }));
    expect(screen.getByText('30e')).toBeDefined();
    expect(screen.getByText(/sur 250 hommes/)).toBeDefined();
  });

  it('pose le joueur à côté des moyennes, et tait celles qui sont trop minces', () => {
    render(
      <Stories
        onFermer={() => {}}
        resultat={resultat({
          classements: {
            tous: rang(47, 512, 'tous', 42),
            sexe: rang(30, 250, 'hommes', 47),
            age: rang(2, 5, '23-26 ans', null),
          },
        })}
      />,
    );
    aller(/Toi face aux autres/);
    expect(screen.getByText(/\+18 points/)).toBeDefined();
    expect(screen.getByText('Moyenne de tous : 42 %')).toBeDefined();
    expect(screen.getByText('Moyenne des hommes : 47 %')).toBeDefined();
    expect(screen.queryByText(/Moyenne des 23-26 ans/)).toBeNull();
  });

  it('laisse les boutons du dernier écran faire leur travail', () => {
    const recommencer = vi.fn();
    render(<Stories onFermer={() => {}} resultat={resultat()} onRecommencer={recommencer} />);
    fireEvent.click(segments().at(-1)!);

    fireEvent.click(screen.getByRole('button', { name: 'Refaire le test' }));
    expect(recommencer).toHaveBeenCalledOnce();
    expect(segments().at(-1)!.getAttribute('aria-current')).toBe('step');
  });

  it('se referme par la croix et par Échap', () => {
    const fermer = vi.fn();
    render(<Stories onFermer={fermer} resultat={resultat()} />);
    fireEvent.click(screen.getByRole('button', { name: /Fermer/ }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(fermer).toHaveBeenCalledTimes(2);
  });
});

describe('placerEtiquettes', () => {
  it('laisse en place des étiquettes qui ne se touchent pas', () => {
    expect(placerEtiquettes([20, 50, 80], 10)).toEqual([20, 50, 80]);
  });

  it('écarte deux moyennes presque égales, sans changer leur ordre', () => {
    const [a, b] = placerEtiquettes([58, 56], 10);
    expect(b).toBeLessThan(a);
    expect(a - b).toBeCloseTo(10);
  });

  it('remonte ce qui déborderait en bas de l’échelle', () => {
    const pos = placerEtiquettes([96, 97, 98], 10);
    expect(Math.max(...pos)).toBeLessThanOrEqual(95);
    expect(pos[1] - pos[0]).toBeCloseTo(10);
  });
});

describe('la cohorte « autre »', () => {
  it('garde son nom sur l’onglet et dans les phrases', () => {
    render(
      <Stories
        onFermer={() => {}}
        resultat={resultat({
          classements: { tous: rang(47, 512, 'tous', 42), sexe: rang(3, 30, 'autre', 39), age: null },
        })}
      />,
    );
    aller(/Ton classement/);
    fireEvent.click(screen.getByRole('tab', { name: /Autre/ }));
    expect(screen.getByText(/sur 30 joueurs « autre »/)).toBeDefined();

    aller(/Toi face aux autres/);
    expect(screen.getByText('Moyenne des joueurs « autre » : 39 %')).toBeDefined();
  });
});
