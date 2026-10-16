import type { ReactNode } from 'react';
import { DON_URL } from '@/config/contact';

/**
 * « Offrir un café » : le lien vers la page de don.
 *
 * L'adresse vient de `config/contact` (Ko-fi par défaut). Le paiement se fait entièrement chez la plateforme : le
 * site n'en voit ni le montant ni les coordonnées.
 */
export function LienCafe({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <a href={DON_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children ?? '☕ Offrir un café'}
    </a>
  );
}
