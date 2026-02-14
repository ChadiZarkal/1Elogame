import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classement Red Flag — Top des pires comportements',
  description: 'Découvre le classement des plus gros Red Flags votés par la communauté. Filtres par sexe, tranche d\'âge. Classement ELO en temps réel.',
  openGraph: {
    title: 'Classement Red Flag — Top des pires comportements',
    description: 'Quels sont les pires Red Flags selon la communauté ? Découvre le classement en temps réel.',
    url: '/classement',
  },
  alternates: { canonical: '/classement' },
};

export default function ClassementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
