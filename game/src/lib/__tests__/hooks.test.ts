/**
 * @file hooks.test.ts
 * @description Tests unitaires pour les hooks React custom.
 * Couvre: useReducedMotion, useHaptics.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion, useHaptics } from '@/lib/hooks';

describe('useReducedMotion', () => {
  let matchMediaListeners: Map<string, (e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    matchMediaListeners = new Map();
  });

  it('retourne false par défaut (pas de préférence reduced motion)', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('retourne true quand matchMedia indique reduced motion', () => {
    // Override matchMedia to return matches: true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_, handler) => {
          matchMediaListeners.set(query, handler as (e: MediaQueryListEvent) => void);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    // Reset matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('réagit aux changements dynamiques de la media query', () => {
    let changeHandler: ((e: { matches: boolean }) => void) | null = null;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, handler: (e: { matches: boolean }) => void) => {
          changeHandler = handler;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate change
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });
    expect(result.current).toBe(true);

    // Reset
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });
});

describe('useHaptics', () => {
  beforeEach(() => {
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  it('tap() vibre pendant 10ms', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.tap();
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('success() vibre avec pattern [10, 30, 10]', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.success();
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
  });

  it('error() vibre avec pattern [50, 20, 50, 20, 50]', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.error();
    expect(navigator.vibrate).toHaveBeenCalledWith([50, 20, 50, 20, 50]);
  });

  it('select() vibre pendant 5ms', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.select();
    expect(navigator.vibrate).toHaveBeenCalledWith(5);
  });

  it('retourne les 4 fonctions haptic', () => {
    const { result } = renderHook(() => useHaptics());
    expect(typeof result.current.tap).toBe('function');
    expect(typeof result.current.success).toBe('function');
    expect(typeof result.current.error).toBe('function');
    expect(typeof result.current.select).toBe('function');
  });
});
