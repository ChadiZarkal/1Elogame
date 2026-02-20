'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'intense';
}

/**
 * AnimatedBackground — Animated gradient orbs that float behind content.
 * GPU-accelerated, low CPU usage, respects reduced motion.
 */
export function AnimatedBackground({
  className,
  variant = 'default',
}: AnimatedBackgroundProps) {
  const opacity = variant === 'subtle' ? 0.15 : variant === 'intense' ? 0.35 : 0.2;

  return (
    <div
      className={cn(
        'fixed inset-0 overflow-hidden pointer-events-none -z-10',
        className
      )}
      aria-hidden="true"
    >
      {/* Red orb — top right */}
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px]"
        style={{
          background: `radial-gradient(circle, rgba(239,68,68,${opacity}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Purple orb — bottom left */}
      <motion.div
        className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px]"
        style={{
          background: `radial-gradient(circle, rgba(139,92,246,${opacity * 0.6}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -20, 30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Amber orb — center */}
      <motion.div
        className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, rgba(245,158,11,${opacity * 0.4}) 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise texture overlay for grain */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
}
