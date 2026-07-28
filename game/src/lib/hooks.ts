'use client';

import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Detect if user prefers reduced motion (accessibility). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
}

function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineStatusSnapshot() {
  return navigator.onLine;
}

/** Detect current network status (true = online). */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatusSnapshot,
    () => true,
  );
}

function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Singleton : le retour ne dépend d'aucun état, et une identité stable permet
 * de le placer sans dommage dans un tableau de dépendances — un objet recréé à
 * chaque rendu y annulerait silencieusement toute mémoïsation.
 */
const HAPTICS = {
  tap: () => vibrate(10),
  success: () => vibrate([10, 30, 10]),
  error: () => vibrate([50, 20, 50, 20, 50]),
  select: () => vibrate(5),
} as const;

/** Trigger haptic feedback on supported devices. */
export function useHaptics() {
  return HAPTICS;
}
