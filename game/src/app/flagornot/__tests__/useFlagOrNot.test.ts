/**
 * @file useFlagOrNot.test.ts
 * @description Tests for useFlagOrNot hook — game phases, submit, history, share, community.
 * Covers: idle phase, loading phase, reveal phase, error fallback, history persistence.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFlagOrNot } from '@/app/flagornot/useFlagOrNot';

vi.mock('@/lib/analytics', () => ({
  trackPageView: vi.fn(),
  trackGameEntry: vi.fn(),
  trackAIRequest: vi.fn(),
  flushSessionToAPI: vi.fn(),
}));

describe('useFlagOrNot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    // Mock fetch for community endpoint
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('démarre en phase idle', () => {
    const { result } = renderHook(() => useFlagOrNot());
    expect(result.current.phase).toBe('idle');
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });

  it('a un historique vide au départ', () => {
    const { result } = renderHook(() => useFlagOrNot());
    expect(result.current.history).toEqual([]);
    expect(result.current.redCount).toBe(0);
    expect(result.current.greenCount).toBe(0);
  });

  it('met à jour l\'input avec setInput', () => {
    const { result } = renderHook(() => useFlagOrNot());
    act(() => {
      result.current.setInput('Test input');
    });
    expect(result.current.input).toBe('Test input');
  });

  it('ne soumet pas si input est vide', async () => {
    const { result } = renderHook(() => useFlagOrNot());
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.phase).toBe('idle');
    expect(global.fetch).toHaveBeenCalledTimes(1); // only community fetch
  });

  it('passe en loading puis reveal au submit', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verdict: 'red', justification: 'Trop red flag' }),
      }) as unknown as typeof fetch;

    const { result } = renderHook(() => useFlagOrNot());

    act(() => { result.current.setInput('Il ment tout le temps'); });

    // Start submit
    let submitPromise: Promise<void>;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // Should be in loading phase
    expect(result.current.phase).toBe('loading');

    // Advance past MIN_LOADING_MS
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await submitPromise!;
    });

    expect(result.current.phase).toBe('reveal');
    expect(result.current.result).toBeDefined();
    expect(result.current.result!.verdict).toBe('red');
  });

  it('ajoute le résultat à l\'historique', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verdict: 'green', justification: 'Pas un red flag' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      }) as unknown as typeof fetch;

    const { result } = renderHook(() => useFlagOrNot());
    act(() => { result.current.setInput('Elle sourit'); });

    await act(async () => {
      const p = result.current.handleSubmit();
      vi.advanceTimersByTime(1000);
      await p;
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].text).toBe('Elle sourit');
    expect(result.current.greenCount).toBe(1);
  });

  it('handleNext réinitialise à idle', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verdict: 'red', justification: 'Red' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      }) as unknown as typeof fetch;

    const { result } = renderHook(() => useFlagOrNot());
    act(() => { result.current.setInput('test'); });

    await act(async () => {
      const p = result.current.handleSubmit();
      vi.advanceTimersByTime(1000);
      await p;
    });

    expect(result.current.phase).toBe('reveal');

    act(() => { result.current.handleNext(); });
    expect(result.current.phase).toBe('idle');
    expect(result.current.input).toBe('');
    expect(result.current.result).toBeNull();
  });

  it('utilise un fallback en cas d\'erreur API', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { submissions: [] } }),
      })
      .mockRejectedValueOnce(new Error('Network error')) as unknown as typeof fetch;

    const { result } = renderHook(() => useFlagOrNot());
    act(() => { result.current.setInput('test'); });

    await act(async () => {
      const p = result.current.handleSubmit();
      vi.advanceTimersByTime(1000);
      await p;
    });

    expect(result.current.phase).toBe('reveal');
    expect(result.current.result).toBeDefined();
    expect(result.current.result!.justification).toContain('bugué');
  });

  it('charge les suggestions de la communauté', () => {
    const { result } = renderHook(() => useFlagOrNot());
    // With no community submissions, should use fallback suggestions
    expect(result.current.displaySuggestions.length).toBeGreaterThan(0);
    expect(result.current.displaySuggestions[0].isCommunity).toBe(false);
  });

  it('charge l\'historique depuis localStorage', () => {
    const savedHistory = [
      { verdict: 'red', justification: 'Red flag!', text: 'Test saved' },
    ];
    localStorage.setItem('flagornot_history', JSON.stringify(savedHistory));

    const { result } = renderHook(() => useFlagOrNot());
    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].text).toBe('Test saved');
    expect(result.current.redCount).toBe(1);
  });
});
