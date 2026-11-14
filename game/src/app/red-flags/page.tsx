/**
 * @module app/red-flags
 * « Les pires red flags, d'après les votes » — le baromètre.
 *
 * C'est la page qui répond à « liste de red flags », « exemples de red
 * flags », « pire red flag » : ce que tous les sites concurrents écrivent de
 * mémoire, et que ce site est le seul à pouvoir mesurer. La définition, elle,
 * reste au guide — une page par intention, pour qu'elles ne se disputent pas
 * la même requête.
 *
 * Rendue côté serveur, régénérée toutes les heures. Si la base se tait, la
 * page le dit et renvoie au classement plutôt que d'afficher des zéros.
 *
 * Le corps de la page est dans `PageRedFlags`, partagé avec `/en/red-flags`.
 */

import type { Metadata } from 'next';
import { PageRedFlags } from './PageRedFlags';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Les pires red flags : la liste classée par les votes des joueurs',
  description:
    'La liste des red flags du quotidien, classée par des milliers de duels : les pires, les moins graves, par thème, et ce que les femmes et les hommes placent en tête. Mise à jour chaque heure.',
  keywords: ['liste red flag', 'exemples de red flags', 'pire red flag', 'red flags', 'redflag', 'classement red flag'],
  alternates: { canonical: '/red-flags' },
  openGraph: {
    title: 'Les pires red flags, d’après les votes',
    description: 'La liste des red flags classée par des milliers de duels, mise à jour chaque heure.',
    url: '/red-flags',
  },
};

export default async function RedFlagsPage() {
  return PageRedFlags({ langue: 'fr' });
}
