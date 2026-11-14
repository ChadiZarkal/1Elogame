'use client';

/**
 * @module components/game/BadgeCategorie
 * La pastille de catégorie sous un comportement, dans la langue de la page.
 *
 * En français, c'est `CategoryBadge` tel quel (composant partagé avec l'admin,
 * qui affiche le libellé français, éventuellement surchargé). En anglais, le
 * même rendu avec le libellé de `CATEGORY_LABELS_EN`.
 */

import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { CATEGORY_LABELS_EN, getCategory } from '@/config/categories';
import { useLangue } from '@/lib/i18n/LangueContexte';

export function BadgeCategorie({ categorie }: { categorie: string }) {
  const langue = useLangue();
  const cat = getCategory(categorie);

  if (langue === 'fr' || !cat) return <CategoryBadge categorie={categorie} />;

  return (
    <div
      className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-sm">{cat.emoji}</span>
      <span className="text-[10px] uppercase tracking-widest font-medium text-neutral-400">
        {CATEGORY_LABELS_EN[categorie] ?? cat.labelFr}
      </span>
    </div>
  );
}
