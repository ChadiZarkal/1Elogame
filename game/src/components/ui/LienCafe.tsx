import type { ReactNode } from 'react';
import { DON_URL } from '@/config/contact';

/**
 * « Offrir un café » : le lien vers la page de don.
 *
 * Ne rend rien tant que `NEXT_PUBLIC_DON_URL` n'est pas réglée (voir
 * `config/contact`). Le paiement se fait entièrement chez la plateforme : le
 * site n'en voit ni le montant ni les coordonnées.
 */
export function LienCafe({ className, children }: { className?: string; children?: ReactNode }) {
  if (!DON_URL) return null;
  return (
    <a href={DON_URL} target="_blank" rel="noopener noreferrer" className={className}>
      {children ?? '☕ Offrir un café'}
    </a>
  );
}
