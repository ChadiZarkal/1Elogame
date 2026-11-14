import type { Metadata } from 'next';
import { FeuillesRft } from '@/app/redflagtest/FeuillesRft';
import { LangueFournie } from '@/lib/i18n/LangueContexte';

/**
 * Le Red Flag Test en anglais (traduction commencée le 2026-11-14).
 *
 * Mêmes composants que la version française (`app/redflagtest`), dans la
 * langue que pose `LangueFournie`. Le contenu de la base est traduit par le
 * serveur (`lib/rft/traduction`).
 *
 * FERMÉ AUX MOTEURS POUR L'INSTANT
 *   La barre du site, le menu et le pied de page sont encore en français, et
 *   les pages vers lesquelles le test renvoie (guide, ressources,
 *   confidentialité) aussi. Ouvrir l'indexation et déclarer le lien entre les
 *   deux versions (`hreflang`) se fera quand l'anglais sera relu et l'entourage
 *   traduit : il suffira de retirer `robots` ici et d'ajouter
 *   `alternates.languages` des deux côtés.
 */
export const metadata: Metadata = {
  title: 'Free Red Flag Test: are you a red flag?',
  description:
    'Take the Red Flag Test, free and anonymous: find out your red flag score as a percentage, your profile and where you rank among other players. No sign-up.',
  keywords: ['red flag test', 'are you a red flag', 'red flag quiz', 'red flag'],
  openGraph: {
    title: 'Red Flag Test: are you a red flag?',
    description: 'The free, anonymous test: your red flag score as a percentage, and where you rank among everyone else.',
    url: '/en/redflagtest',
    locale: 'en_US',
  },
  alternates: { canonical: '/en/redflagtest' },
  robots: { index: false, follow: true },
};

export default function RedflagtestEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangueFournie langue="en">
      <FeuillesRft />
      {children}
    </LangueFournie>
  );
}
