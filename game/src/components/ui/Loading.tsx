'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-live="polite">
      <div className={cn('animate-spin rounded-full border-4 border-[#333] border-t-[#DC2626]', sizes[size])} />
      {text && <p className="text-[#A3A3A3] text-sm animate-pulse">{text}</p>}
    </div>
  );
}

export function FullPageLoading({ text = 'Chargement...' }: { text?: string }) {
  return (
    /* Le voile partait du haut de la fenêtre et recouvrait donc la barre de
       navigation du site : à chaque chargement de duel, le seul chemin de
       sortie disparaissait et la hauteur perçue de la page clignotait. */
    <div
      className="fixed inset-x-0 bottom-0 flex items-center justify-center bg-[#0D0D0D]"
      style={{ top: 'var(--header-h, 3rem)' }}
    >
      <Loading size="lg" text={text} />
    </div>
  );
}
