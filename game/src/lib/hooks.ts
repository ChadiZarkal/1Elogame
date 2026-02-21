'use client';

import { useEffect, useState } from 'react';

/** Detect if user prefers reduced motion (accessibility). */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/** Trigger haptic feedback on supported devices. */
export function useHaptics() {
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    tap: () => vibrate(10),
    success: () => vibrate([10, 30, 10]),
    error: () => vibrate([50, 20, 50, 20, 50]),
    select: () => vibrate(5),
  };
}
