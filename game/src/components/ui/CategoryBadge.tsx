'use client';

import { getCategory, getCategoryClasses } from '@/config/categories';

interface CategoryBadgeProps {
  categorie: string;
  /** 'pill' for compact admin-style, 'card' for glassmorphism game-style */
  variant?: 'pill' | 'card';
}

/**
 * Shared category badge used across admin and game views.
 */
export function CategoryBadge({ categorie, variant = 'card' }: CategoryBadgeProps) {
  const cat = getCategory(categorie);

  if (!cat) {
    return (
      <span className="text-[#737373] text-xs uppercase tracking-widest font-medium">
        {categorie}
      </span>
    );
  }

  if (variant === 'pill') {
    const classes = getCategoryClasses(categorie);
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${classes}`}>
        {cat.emoji} {cat.label}
      </span>
    );
  }

  return (
    <div
      className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-sm">{cat.emoji}</span>
      <span className="text-[10px] uppercase tracking-widest font-medium text-neutral-400">
        {cat.labelFr}
      </span>
    </div>
  );
}
