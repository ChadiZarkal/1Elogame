import type { Metadata } from 'next';
import { LangueFournie } from '@/lib/i18n/LangueContexte';

/**
 * Tout ce qui vit sous `/en` : l'anglais (traduction commencée le 2026-11-14,
 * l'accueil et le Red Flag Test).
 *
 * FERMÉ AUX MOTEURS POUR L'INSTANT
 *   Les pages vers lesquelles l'anglais renvoie (les trois autres jeux, le
 *   guide, les ressources, la confidentialité) sont en français. Ouvrir
 *   l'indexation et déclarer le lien entre les deux versions (`hreflang`) se
 *   fera quand l'anglais sera relu : retirer `robots` ici et ajouter
 *   `alternates.languages` des deux côtés.
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
