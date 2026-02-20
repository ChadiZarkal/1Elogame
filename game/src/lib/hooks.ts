'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion.
 * Used throughout the app to disable/reduce animations for accessibility.
 */
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

/**
 * Hook to detect if user is on a mobile device (touch-based).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
        window.innerWidth < 768
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

/**
 * Hook to trigger haptic feedback on supported devices.
 */
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

/**
 * Hook to detect viewport safe area insets (notch, home indicator).
 */
export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
      });
    };
    update();
  }, []);

  return insets;
}
