'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
  as?: 'div' | 'button';
}

/**
 * GlassCard — Glassmorphism card with optional glow on hover.
 * GPU-accelerated blur, performant for mobile.
 */
export function GlassCard({
  children,
  className,
  glowColor = 'rgba(239, 68, 68, 0.15)',
  hoverGlow = true,
  onClick,
  as = 'div',
}: GlassCardProps) {
  const Component = as === 'button' ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl block w-full',
        'bg-[#151518]/80 backdrop-blur-xl',
        'border border-white/[0.06]',
        'transition-all duration-300 !text-inherit',
        onClick && 'cursor-pointer active:scale-[0.98]',
        className
      )}
      style={{ color: 'inherit' }}
      whileHover={
        hoverGlow
          ? {
              borderColor: 'rgba(255,255,255,0.12)',
              boxShadow: `0 8px 32px ${glowColor}`,
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.97 } : undefined}
    >
      {children}
    </Component>
  );
}
