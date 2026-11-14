/**
 * @file storiesAnglais.test.tsx
 * @description Red Flag Test — les stories en anglais.
 *
 * Chaque écran est parcouru, et aucun ne doit laisser passer un mot de
 * français : ni dans le texte des composants, ni dans ce que le serveur écrit
 * (légendes, verdict, catégories), ni dans les libellés pour lecteurs d'écran.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Resultat } from '@/lib/rft/types';
import { classement, legendeAgeCourte, legendeCohorte, legendeSexeCourte } from '@/lib/rft/score';
import { traduireResultat } from '@/lib/rft/traduction';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { Stories } from '@/app/redflagtest/Stories';

const FRANCAIS = /\b(Ton|Ta|Tes|sur|des|joueurs|hommes|femmes|moyenne|Écran|réponse|Toi|Partager|Défie|Voir|Refaire)\b/;

function resultatFr(): Resultat {
  return {
    score: 68,
    verdict: { id: 'v', minScore: 50, emoji: '🟠', titre: 'ÇA SE VOIT DE LOIN', soustitre: 'Tes proches le savent déjà. Toi, tu viens de l’apprendre.' },
    classements: {
      tous: classement(512, 46, 'tous', 42),
      sexe: classement(250, 29, legendeSexeCourte('homme'), 47),
      age: classement(6, 1, legendeAgeCourte('23-26'), 36),
    },
    axes: [
      { tagId: 'a', label: 'Emprise', color: null, valeur: 82, points: 41, maximum: 50 },
      { tagId: 'b', label: 'Loyauté', color: null, valeur: 38, points: 19, maximum: 50 },
    ],
    pointNoir: { tagId: 'a', label: 'Emprise', color: null, valeur: 82, points: 41, maximum: 50 },
    comparaison: {
      cohorte: 'sexe_age',
      legende: legendeCohorte('sexe_age', { sexe: 'homme', age: '23-26' }),
      ecart: 18, moyenne: 50, effectif: 40,
    },
    archetype: { id: 'x', tagA: 'a', tagB: null, emoji: '🔑', titre: 'LE PROPRIÉTAIRE', soustitre: 'Tu appelles ça de l’attention. Personne d’autre ne l’appelle comme ça.' },
    reponseDecisive: { question: 'Tu as déjà trompé ton ou ta partenaire ?', reponse: 'Oui', points: 9 },
    ressources: [{
      label: 'Emprise',
      texte: 'Surveiller, fouiller, décider pour l’autre : ce sont des comportements qui ont un nom, et une échelle. Le violentomètre la donne.',
      lien: '/ressources/violentometre',
    }],
    highlights: [{ question: 'Tu cuisines ?', reponse: 'Non', pique: 'Quelqu’un cuisine. La question est de savoir qui.', part: 12 }],
    participants: 512,
    codePartage: 'abc',
    paris: { homme: { effectif: 40, pari: 41, score: 39 }, femme: null },
  };
}

describe('Red Flag Test — stories en anglais', () => {
  it('ne laisse passer aucun mot de français, d’un écran à l’autre', () => {
    render(
      <LangueFournie langue="en">
        <Stories onFermer={() => {}} onRecommencer={() => {}} pari={40} resultat={traduireResultat(resultatFr(), 'en')} />
      </LangueFournie>,
    );

    const segments = screen.getAllByRole('button', { name: /^Screen \d+ of \d+/ });
    expect(segments.length).toBeGreaterThanOrEqual(8);

    for (const segment of segments) {
      fireEvent.click(segment);
      const dialogue = screen.getByRole('dialog');
      const texte = dialogue.textContent ?? '';
      expect(texte, segment.getAttribute('aria-label') ?? '').not.toMatch(FRANCAIS);
      for (const el of dialogue.querySelectorAll('[aria-label]')) {
        expect(el.getAttribute('aria-label')).not.toMatch(FRANCAIS);
      }
    }
  });

  it('écrit les phrases de classement en anglais', () => {
    render(
      <LangueFournie langue="en">
        <Stories onFermer={() => {}} resultat={traduireResultat(resultatFr(), 'en')} />
      </LangueFournie>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Your ranking$/ }));
    expect(screen.getByText('47th')).toBeDefined();
    expect(screen.getByText('out of 512 players')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /You vs\. everyone else$/ }));
    expect(screen.getByText(/above the average for men aged 23-26/)).toBeDefined();
  });

  it('pose la version anglaise sur le document', () => {
    render(<LangueFournie langue="en"><p>hi</p></LangueFournie>);
    expect(document.documentElement.lang).toBe('en');
  });
});
