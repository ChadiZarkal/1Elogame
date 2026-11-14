'use client';

/**
 * @module components/ui/LienEvitement
 * Le lien « aller au contenu », premier élément de chaque page, que lisent les
 * lecteurs d'écran et qu'atteint la touche Tab.
 *
 * Client et non écrit dans le gabarit racine : celui-ci ne connaît pas
 * l'adresse, et ce lien restait en français sur les pages anglaises
 * (relevé le 2026-11-14).
 */

import { usePathname } from 'next/navigation';
import { langueDuChemin } from '@/lib/i18n/langue';

export function LienEvitement() {
  const anglais = langueDuChemin(usePathname()) === 'en';
  return (
    <a href="#main-content" className="skip-to-content">
      {anglais ? 'Skip to main content' : 'Aller au contenu principal'}
    </a>
  );
}
