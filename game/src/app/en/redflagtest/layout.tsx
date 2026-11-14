import type { Metadata } from 'next';
import { FeuillesRft } from '@/app/redflagtest/FeuillesRft';
import { LangueFournie } from '@/lib/i18n/LangueContexte';
import { alternances } from '@/lib/i18n/alternances';

/**
 * Le Red Flag Test en anglais (traduction commencée le 2026-11-14).
 *
 * Mêmes composants que la version française (`app/redflagtest`), dans la
 * langue que pose `LangueFournie`. Le contenu de la base est traduit par le
 * serveur (`lib/rft/traduction`).
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
  alternates: alternances('en', '/redflagtest'),
};

export default function RedflagtestEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangueFournie langue="en">
      <FeuillesRft />
      {children}
    </LangueFournie>
  );
}
