/**
 * @module content/articles
 * La liste des articles, du plus récent au plus ancien.
 *
 * Ajouter un article : l'écrire dans son propre fichier sur le modèle des
 * autres, puis l'ajouter ici. La page, le sitemap et le balisage suivent.
 */

import type { Article } from './types';
import { bossCollegues } from './boss-collegues';
import { hommesFemmes } from './hommes-femmes';
import { outilsAutoEvaluation } from './outils-auto-evaluation';

export type { Article, Bloc, SourceArticle } from './types';

export const ARTICLES: Article[] = [bossCollegues, hommesFemmes, outilsAutoEvaluation].sort(
  (a, b) => b.publie.localeCompare(a.publie),
);

export function articleParSlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** 29 septembre 2026 */
export function dateLongue(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T12:00:00Z`));
}
