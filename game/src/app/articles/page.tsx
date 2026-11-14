/**
 * @module app/articles
 * La liste des articles. Le contenu est dans `PageArticles`, partagé avec
 * `/en/articles`.
 */

import type { Metadata } from 'next';
import { PageArticles as Liste } from './PageArticles';
import { alternances } from '@/lib/i18n/alternances';

export const metadata: Metadata = {
  title: 'Articles : ce que les votes disent des red flags',
  description:
    "Analyses tirées des votes des joueurs de Red or Green, et explications des outils d'auto-évaluation : red flags, écarts entre hommes et femmes, violentomètre.",
  alternates: alternances('fr', '/articles'),
};

export default function PageArticles() {
  return <Liste langue="fr" />;
}
