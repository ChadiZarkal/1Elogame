'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
}

/**
 * AnimatedCounter — Smoothly animates between number values.
 * Great for scores, stats, live counters.
 */
export function AnimatedCounter({
  value,
  className,
  format = (n) => n.toLocaleString('fr-FR'),
}: AnimatedCounterProps) {
  return (
    <span className={cn('inline-flex overflow-hidden tabular-nums', className)}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        >
          {format(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
