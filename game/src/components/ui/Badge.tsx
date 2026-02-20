'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.06] text-[#A1A1AA] border border-white/[0.06]',
        red: 'bg-red-500/12 text-red-400 border border-red-500/20',
        green: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20',
        gold: 'bg-amber-500/12 text-amber-400 border border-amber-500/20',
        purple: 'bg-violet-500/12 text-violet-400 border border-violet-500/20',
        blue: 'bg-blue-500/12 text-blue-400 border border-blue-500/20',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[9px]',
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge — Small label for tags, status indicators, categories.
 */
export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
