/**
 * @file AnalyticsProvider.test.tsx
 * @description Tests for AnalyticsProvider — page view tracking, game entry tracking, flush on unload.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

const mockTrackPageView = vi.fn();
const mockTrackGameEntry = vi.fn();
const mockFlushSessionToAPI = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackPageView: (...args: unknown[]) => mockTrackPageView(...args),
  trackGameEntry: (...args: unknown[]) => mockTrackGameEntry(...args),
  flushSessionToAPI: (...args: unknown[]) => mockFlushSessionToAPI(...args),
}));

let currentPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}));

// Import after mocks
import { AnalyticsProvider } from '@/components/ui/AnalyticsProvider';

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    currentPathname = '/';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rend ses enfants', () => {
    const { getByText } = render(
      <AnalyticsProvider>
        <div>Child content</div>
      </AnalyticsProvider>
    );
    expect(getByText('Child content')).toBeDefined();
  });

  it('appelle trackPageView avec le pathname actuel', () => {
    currentPathname = '/classement';
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    expect(mockTrackPageView).toHaveBeenCalledWith('/classement');
  });

  it('appelle trackGameEntry pour /jeu', () => {
    currentPathname = '/jeu';
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    expect(mockTrackGameEntry).toHaveBeenCalledWith('redflag');
  });

  it('appelle trackGameEntry pour /jeu/jouer', () => {
    currentPathname = '/jeu/jouer';
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    expect(mockTrackGameEntry).toHaveBeenCalledWith('redflag');
  });

  it('appelle trackGameEntry pour /flagornot', () => {
    currentPathname = '/flagornot';
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    expect(mockTrackGameEntry).toHaveBeenCalledWith('flagornot');
  });

  it('ne trackGame pas pour une page quelconque', () => {
    currentPathname = '/about';
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    expect(mockTrackGameEntry).not.toHaveBeenCalled();
  });

  it('envoie la session à la fermeture de la page', () => {
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    window.dispatchEvent(new Event('pagehide'));
    expect(mockFlushSessionToAPI).toHaveBeenCalledTimes(1);
  });

  it('envoie la session quand la page passe en arrière-plan, pas quand elle revient', () => {
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    const visibilite = vi.spyOn(document, 'visibilityState', 'get');

    visibilite.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mockFlushSessionToAPI).not.toHaveBeenCalled();

    visibilite.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(mockFlushSessionToAPI).toHaveBeenCalledTimes(1);
    visibilite.mockRestore();
  });

  // Un envoi par minute et par onglet ouvert était, le 2026-10-23, la plus
  // grosse source d'écritures en base.
  it("n'envoie rien à intervalle régulier", () => {
    render(<AnalyticsProvider><div /></AnalyticsProvider>);
    vi.advanceTimersByTime(10 * 60_000);
    expect(mockFlushSessionToAPI).not.toHaveBeenCalled();
  });
});
