import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classement Red Flag — Top des pires comportements',
  description: 'Découvre le classement des plus gros Red Flags votés par la communauté. Filtres par sexe, tranche d\'âge. Classement ELO en temps réel.',
  keywords: [
    'classement red flag',
    'top red flags',
    'pires red flags',
    'red flag classement',
    'red or green classement',
    'meilleurs green flags',
    'classement elo',
  ],
  openGraph: {
    title: 'Classement Red Flag — Top des pires comportements',
    description: 'Quels sont les pires Red Flags selon la communauté ? Découvre le classement en temps réel.',
    url: '/classement',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classement Red Flag — Top des pires comportements',
    description: 'Quels sont les pires Red Flags selon la communauté ? Découvre le classement en temps réel.',
  },
  alternates: { canonical: '/classement' },
};

// Le balisage ItemList est émis par la page elle-même : lui seul connaît les
// lignes réellement rendues. Le déclarer ici obligeait à écrire un nombre en
// dur, qui ne correspondait pas au classement servi.
export default function ClassementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
