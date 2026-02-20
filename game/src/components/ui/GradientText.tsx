'use client';

import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
  via?: string;
}

/**
 * GradientText — Text with animated gradient.
 * Used for headings, hero titles, emphasis.
 */
export function GradientText({
  children,
  className,
  from = '#EF4444',
  to = '#F97316',
  via,
}: GradientTextProps) {
  const gradient = via
    ? `linear-gradient(135deg, ${from}, ${via}, ${to})`
    : `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <span
      className={cn(
        'bg-clip-text text-transparent inline-block',
        className
      )}
      style={{ backgroundImage: gradient }}
    >
      {children}
    </span>
  );
}
