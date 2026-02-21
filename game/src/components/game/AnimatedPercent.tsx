'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate as fmAnimate } from 'framer-motion';

/**
 * Animated counter that rolls up from 0 to the final percentage.
 * Used in result screens to reveal vote percentages with a smooth animation.
 */
export function AnimatedPercent({
  value,
  delay = 0.2,
  className,
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    const ctrl = fmAnimate(count, value, {
      duration: 0.8,
      delay,
      ease: 'easeOut',
    });
    return () => ctrl.stop();
  }, [count, value, delay]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
