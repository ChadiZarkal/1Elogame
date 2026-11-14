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
import { bossColleguesEn } from './en/boss-collegues';
import { hommesFemmesEn } from './en/hommes-femmes';
import { outilsAutoEvaluationEn } from './en/outils-auto-evaluation';
import { localeDe, type Langue } from '@/lib/i18n/langue';

export type { Article, Bloc, SourceArticle } from './types';

export const ARTICLES: Article[] = [bossCollegues, hommesFemmes, outilsAutoEvaluation].sort(
  (a, b) => b.publie.localeCompare(a.publie),
);

/**
 * Les mêmes articles en anglais (`./en`, 2026-11-14) : même adresse (`slug`),
 * même ordre. Un article ajouté en français sans version anglaise n'apparaît
 * simplement pas sous `/en/articles`.
 */
export const ARTICLES_EN: Article[] = [bossColleguesEn, hommesFemmesEn, outilsAutoEvaluationEn].sort(
  (a, b) => b.publie.localeCompare(a.publie),
);

export function articlesDe(langue: Langue): Article[] {
  return langue === 'en' ? ARTICLES_EN : ARTICLES;
}

export function articleParSlug(slug: string, langue: Langue = 'fr'): Article | undefined {
  return articlesDe(langue).find((a) => a.slug === slug);
}

/** 29 septembre 2026 · September 29, 2026 */
export function dateLongue(iso: string, langue: Langue = 'fr'): string {
  return new Intl.DateTimeFormat(localeDe(langue), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T12:00:00Z`));
}
