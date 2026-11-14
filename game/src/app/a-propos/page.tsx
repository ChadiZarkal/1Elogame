import type { Metadata } from 'next';
import { PageAPropos } from './PageAPropos';
import { alternances } from '@/lib/i18n/alternances';

export const metadata: Metadata = {
  title: 'À propos — qui édite Red or Green et pourquoi',
  description:
    "Red or Green est un site de jeux sur les comportements relationnels, doublé d'outils d'auto-évaluation issus de sources institutionnelles. Notre démarche, nos limites, nos partis pris.",
  alternates: alternances('fr', '/a-propos'),
};

/** Le corps de la page est dans `PageAPropos`, partagé avec `/en/a-propos`. */
export default function AProposPage() {
  return <PageAPropos langue="fr" />;
}
