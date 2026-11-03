/**
 * @file interstitiel.test.tsx
 * @description La pause publicitaire avant le résultat : le bouton ne s'ouvre
 * qu'une fois le compte à rebours écoulé ET le résultat revenu.
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

const { scripts, garde } = vi.hoisted(() => ({
  scripts: [] as Array<[string, boolean]>,
  garde: { armements: 0 },
}));
vi.mock('@/components/ads/useAdsterraScript', () => ({
  useAdsterraScript: (src: string, actif: boolean) => { scripts.push([src, actif]); },
}));
vi.mock('@/components/ads/gardePopunder', () => ({
  installerGardePopunder: () => {},
  desarmerPopunder: () => {},
  armerPopunder: () => { garde.armements += 1; },
}));

import { Interstitiel } from '@/app/redflagtest/Interstitiel';
import { RFT_INTERSTITIEL_DUREE_S, RFT_POPUNDER } from '@/config/ads';

const bouton = () => screen.getByRole('button') as HTMLButtonElement;

describe('Interstitiel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    scripts.length = 0;
    garde.armements = 0;
  });

  // Une pub à l'entrée du récap, pas une à chaque « Continuer » : le pop-under
  // n'est permis qu'une fois, quand « Voir mon résultat » devient cliquable.
  it('n’autorise le pop-under qu’une fois, au moment où le résultat s’ouvre', () => {
    render(<Interstitiel pret onContinuer={() => {}} />);
    expect(garde.armements).toBe(0);
    act(() => { vi.advanceTimersByTime(RFT_INTERSTITIEL_DUREE_S * 1000); });
    expect(garde.armements).toBe(1);
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(garde.armements).toBe(1);
  });
  afterEach(() => {
    vi.useRealTimers();
    document.head.innerHTML = '';
  });

  it('garde le bouton fermé pendant le compte à rebours', () => {
    const continuer = vi.fn();
    render(<Interstitiel pret onContinuer={continuer} />);
    expect(bouton().disabled).toBe(true);
    expect(bouton().textContent).toMatch(/dans 5/);

    act(() => { vi.advanceTimersByTime((RFT_INTERSTITIEL_DUREE_S - 1) * 1000); });
    expect(bouton().disabled).toBe(true);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(bouton().disabled).toBe(false);
    fireEvent.click(bouton());
    expect(continuer).toHaveBeenCalledOnce();
  });

  it('attend le résultat même après le compte à rebours', () => {
    const { rerender } = render(<Interstitiel pret={false} onContinuer={() => {}} />);
    act(() => { vi.advanceTimersByTime(RFT_INTERSTITIEL_DUREE_S * 1000); });
    expect(bouton().disabled).toBe(true);
    expect(bouton().textContent).toMatch(/Encore un instant/);

    rerender(<Interstitiel pret onContinuer={() => {}} />);
    expect(bouton().disabled).toBe(false);
  });

  it('arme le pop-under', () => {
    render(<Interstitiel pret onContinuer={() => {}} />);
    expect(scripts.find(([src]) => src === RFT_POPUNDER.src)?.[1]).toBe(true);
  });

  // Jusqu'au 2026-10-28, un script AdSense déjà chargé désarmait le pop-under
  // (règlement Google). AdSense est retiré : sa présence ne change plus rien.
  it('arme le pop-under même si un script Google traîne sur la page', () => {
    const s = document.createElement('script');
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    document.head.appendChild(s);
    render(<Interstitiel pret onContinuer={() => {}} />);
    expect(scripts.find(([src]) => src === RFT_POPUNDER.src)?.[1]).toBe(true);
  });
});
