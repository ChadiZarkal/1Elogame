/**
 * @file page.test.tsx
 * @description Red Flag Test — ce que la page dit avant que le questionnaire
 * ne soit chargé.
 *
 * Le questionnaire arrive par `fetch`, après l'hydratation. Tant qu'il n'est
 * pas là, le HTML ne contenait que « Red Flag Test — Chargement… » : quatorze
 * mots, sur la page qui doit se classer pour « red flag test ». Ce test garde
 * la présentation dans le premier rendu, requête en suspens — c'est l'état
 * exact que voit un robot d'indexation au premier passage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RedflagtestPage from '@/app/redflagtest/page';

describe('Red Flag Test — premier rendu', () => {
  beforeEach(() => {
    // Une requête qui ne répond jamais : le questionnaire reste en chargement.
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
  });

  it('présente le test avant que le questionnaire soit chargé', () => {
    render(<RedflagtestPage />);

    expect(screen.getByText('Chargement…')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /Le Red Flag Test, c.est quoi/ })).toBeDefined();
    expect(screen.getByText(/ton score de red flag en pourcentage/)).toBeDefined();
  });

  it('mène à la définition et aux réponses des autres joueurs', () => {
    render(<RedflagtestPage />);

    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(liens).toContain('/guide');
    expect(liens).toContain('/redflagtest/stats');
  });

  it('balise la page comme un quiz', () => {
    const { container } = render(<RedflagtestPage />);

    const blocs = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent ?? '{}'));
    const types = blocs.flatMap((b) => (b['@graph'] ?? [b]).map((x: { '@type': string }) => x['@type']));
    expect(types).toContain('Quiz');
  });
});
