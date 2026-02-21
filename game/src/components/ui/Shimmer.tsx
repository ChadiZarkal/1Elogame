'use client';

import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Shimmer — Skeleton loading placeholder with animated shine effect.
 */
export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/[0.04]',
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Chargement..."
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}
