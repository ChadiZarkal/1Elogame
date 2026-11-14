import type { Metadata } from 'next';
import { PageSources } from './PageSources';

export const metadata: Metadata = {
  title: 'Sources — sur quoi reposent nos outils',
  description:
    "Les outils d'auto-évaluation de Red or Green s'appuient sur des barèmes produits par des institutions publiques et des associations spécialisées. Références et limites.",
  alternates: { canonical: '/sources' },
};

/** Le corps de la page est dans `PageSources`, partagé avec `/en/sources`. */
export default function SourcesPage() {
  return <PageSources langue="fr" />;
}
