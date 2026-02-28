'use client';

import { useState } from 'react';
import { ElementDTO } from '@/types/game';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

interface DuelInterfaceProps {
  elementA: ElementDTO;
  elementB: ElementDTO;
  onVote: (winnerId: string, loserId: string) => void;
  disabled?: boolean;
}

export function DuelInterface({ elementA, elementB, onVote, disabled }: DuelInterfaceProps) {
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);

  const handleClick = (side: 'a' | 'b') => {
    if (disabled || selected) return;
    setSelected(side);
    setTimeout(() => {
      onVote(
        side === 'a' ? elementA.id : elementB.id,
        side === 'a' ? elementB.id : elementA.id,
      );
    }, 350);
  };

  const cardClass = (side: 'a' | 'b') => {
    const isSelected = selected === side;
    const isOther = selected !== null && !isSelected;
    return [
      'flex-1 flex items-center justify-center p-6 relative z-10 bg-[#1A1A1A] border transition-all duration-[250ms]',
      !selected && 'hover:bg-[#242424] hover:border-[#DC2626] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] active:bg-[#2A2A2A] active:scale-[0.98] cursor-pointer',
      selected && 'cursor-default',
      isSelected && 'scale-[1.03] border-[#DC2626]',
      isOther && 'scale-95 opacity-40 border-[#333333]',
      !isSelected && !isOther && 'border-[#333333]',
      side === 'a' ? 'animate-card-a' : 'animate-card-b',
    ].filter(Boolean).join(' ');
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-[#0D0D0D]">
      {/* Element A - Top half */}
      <button
        onClick={() => handleClick('a')}
        disabled={disabled || !!selected}
        className={cardClass('a')}
      >
        <div className="text-center max-w-lg">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5F5F5] leading-tight px-4 animate-fade-in-fast">
            {elementA.texte}
          </p>
          <CategoryBadge categorie={elementA.categorie} />
        </div>
      </button>
      
      {/* Divider VS */}
      <div className="relative h-0 z-20">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-[#DC2626] rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-vs-pop">
            <span className="text-lg font-black text-white tracking-tight">VS</span>
          </div>
        </div>
      </div>
      
      {/* Element B - Bottom half */}
      <button
        onClick={() => handleClick('b')}
        disabled={disabled || !!selected}
        className={cardClass('b')}
      >
        <div className="text-center max-w-lg">
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5F5F5] leading-tight px-4 animate-fade-in-fast">
            {elementB.texte}
          </p>
          <CategoryBadge categorie={elementB.categorie} />
        </div>
      </button>
    </div>
  );
}
