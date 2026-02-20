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

/**
 * GameCardSkeleton — Loading placeholder for game cards on homepage.
 */
export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-5">
      <div className="flex items-center gap-4">
        <Shimmer className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

/**
 * StatsSkeleton — Loading placeholder for stats.
 */
export function StatsSkeleton() {
  return (
    <div className="flex justify-center gap-4">
      <Shimmer className="h-5 w-24" />
      <Shimmer className="h-5 w-24" />
    </div>
  );
}
