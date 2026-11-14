import type { Metadata } from 'next';
import { LangueFournie } from '@/lib/i18n/LangueContexte';

/**
 * Tout ce qui vit sous `/en` : l'anglais (2026-11-14). Tout le site public
 * est traduit, sauf « C'est un 10 mais… » (`/dixmais`), laissé en français à
 * la demande de Chadi.
 *
 * FERMÉ AUX MOTEURS POUR L'INSTANT
 *   L'anglais n'a pas encore été relu par un anglophone. Ouvrir l'indexation
 *   et déclarer le lien entre les deux versions (`hreflang`) se fera ensuite :
 *   retirer `robots` ici et ajouter `alternates.languages` des deux côtés.
 */
export const metadata: Metadata = {
  title: {
    default: 'Red or Green — free Red Flag Test and red flag games',
    template: '%s | Red or Green',
  },
  description:
    'Red or Green: the free, anonymous Red Flag Test — your red flag score as a percentage and where you rank — plus red flag games.',
  openGraph: { locale: 'en_US', siteName: 'Red or Green' },
  robots: { index: false, follow: true },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <LangueFournie langue="en">{children}</LangueFournie>;
}
