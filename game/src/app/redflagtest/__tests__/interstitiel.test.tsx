/**
 * @file interstitiel.test.tsx
 * @description La pause publicitaire avant le résultat : le bouton ne s'ouvre
 * qu'une fois le compte à rebours écoulé ET le résultat revenu.
 */

import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

const { scripts } = vi.hoisted(() => ({ scripts: [] as Array<[string, boolean]> }));
vi.mock('@/components/ads/useAdsterraScript', () => ({
  useAdsterraScript: (src: string, actif: boolean) => { scripts.push([src, actif]); },
}));

import { Interstitiel } from '@/app/redflagtest/Interstitiel';
import { RFT_INTERSTITIEL_DUREE_S, RFT_POPUNDER } from '@/config/ads';

const bouton = () => screen.getByRole('button') as HTMLButtonElement;

describe('Interstitiel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    scripts.length = 0;
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

  // Le règlement AdSense interdit ses annonces à côté d'un pop-under.
  it('ne charge pas le pop-under quand AdSense est sur la page', () => {
    const s = document.createElement('script');
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    document.head.appendChild(s);
    render(<Interstitiel pret onContinuer={() => {}} />);
    expect(scripts.find(([src]) => src === RFT_POPUNDER.src)?.[1]).toBe(false);
  });

  it('charge le pop-under quand AdSense est absent', () => {
    render(<Interstitiel pret onContinuer={() => {}} />);
    expect(scripts.find(([src]) => src === RFT_POPUNDER.src)?.[1]).toBe(true);
  });
});
