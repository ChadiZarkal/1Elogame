import type { Metadata } from 'next';
import { LangueFournie } from '@/lib/i18n/LangueContexte';

/**
 * Tout ce qui vit sous `/en` : l'anglais (2026-11-14). Tout le site public
 * est traduit, « C'est un 10 mais… » compris ; l'administration reste en
 * français.
 *
 * OUVERT AUX MOTEURS depuis le 2026-11-14 (demande de Chadi). Chaque page
 *   déclare sa version française et sa version anglaise (`hreflang`) par
 *   `alternances()` (`lib/i18n/alternances.ts`), des deux côtés.
 */
export const metadata: Metadata = {
  title: {
    default: 'Red or Green — free Red Flag Test and red flag games',
    template: '%s | Red or Green',
  },
  description:
    'Red or Green: the free, anonymous Red Flag Test — your red flag score as a percentage and where you rank — plus red flag games.',
  openGraph: { locale: 'en_US', siteName: 'Red or Green' },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <LangueFournie langue="en">{children}</LangueFournie>;
}
