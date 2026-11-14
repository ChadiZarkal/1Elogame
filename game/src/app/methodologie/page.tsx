import type { Metadata } from 'next';
import { PageMethodologie } from './PageMethodologie';
import { alternances } from '@/lib/i18n/alternances';

export const metadata: Metadata = {
  title: 'Méthodologie — comment on classe les red flags',
  description:
    "Le classement Red or Green repose sur un système de score Elo alimenté par les votes de la communauté. Fonctionnement, taille d'échantillon, biais assumés et limites.",
  alternates: alternances('fr', '/methodologie'),
};

export const revalidate = 3600;

/** Le corps de la page est dans `PageMethodologie`, partagé avec `/en/methodologie`. */
export default async function MethodologiePage() {
  return PageMethodologie({ langue: 'fr' });
}
