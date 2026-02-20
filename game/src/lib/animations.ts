/**
 * Centralized animation variants for Framer Motion.
 * Consistent, performant, accessibility-aware animations.
 */
import type { Variants, Transition } from 'framer-motion';

// ─── Default Transitions ───────────────────────────────────
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.4,
};

export const quickTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

// ─── Fade Variants ─────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -12, transition: quickTransition },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 12, transition: quickTransition },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, transition: quickTransition },
};

// ─── Stagger Container ────────────────────────────────────
// NOTE: container stays opacity 1 — only children animate in
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 24,
    },
  },
};

// ─── Card Variants ─────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springTransition,
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// ─── Page Transition ───────────────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ─── Pulse / Glow ──────────────────────────────────────────
export const pulseGlow: Variants = {
  rest: {
    boxShadow: '0 0 0px rgba(220, 38, 38, 0)',
  },
  active: {
    boxShadow: [
      '0 0 20px rgba(220, 38, 38, 0.3)',
      '0 0 40px rgba(220, 38, 38, 0.5)',
      '0 0 20px rgba(220, 38, 38, 0.3)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ─── Emoji bounce ──────────────────────────────────────────
export const emojiBounce: Variants = {
  rest: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, -12, 12, -6, 6, 0],
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// ─── Shimmer / Skeleton ────────────────────────────────────
export const shimmer: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ─── Helper: get reduced motion variants ───────────────────
export function getMotionProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {};
}
