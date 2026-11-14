import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Oracle stats — Red or Green' },
  description: 'The verdicts handed down by the AI Oracle: red flag / green flag split and trends spotted in what people submit.',
  openGraph: {
    title: 'Oracle stats — Red or Green',
    description: 'Verdict split and trends in what people submit to the AI Oracle.',
    url: '/en/flagornot/stats',
    locale: 'en_US',
  },
  alternates: { canonical: '/en/flagornot/stats' },
  // Comme la version française : chiffres chargés côté navigateur, page non
  // indexée tant qu'elle n'est pas rendue côté serveur.
  robots: { index: false, follow: true },
};

export default function FlagOrNotStatsEnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
