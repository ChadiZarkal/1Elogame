'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'glow';
  glowColor?: string;
}

/**
 * IconButton — Circular icon button with motion effects.
 * Accessible with aria-label, hover/tap feedback.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
  size = 'md',
  variant = 'default',
  glowColor = 'rgba(239, 68, 68, 0.3)',
}: IconButtonProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const variants = {
    default: 'bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1]',
    ghost: 'text-white/40 hover:text-white hover:bg-white/[0.06]',
    glow: 'bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200',
        sizes[size],
        variants[variant],
        className
      )}
      whileHover={
        variant === 'glow'
          ? { boxShadow: `0 0 20px ${glowColor}` }
          : { scale: 1.05 }
      }
      whileTap={{ scale: 0.92 }}
      aria-label={label}
    >
      <Icon size={iconSizes[size]} />
    </motion.button>
  );
}
