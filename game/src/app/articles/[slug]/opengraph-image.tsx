import { carteOg, TAILLE_OG } from '@/lib/carteOg';
import { ARTICLES, articleParSlug } from '@/content/articles';

export const size = TAILLE_OG;
export const contentType = 'image/png';
export const alt = 'Article — Red or Green';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleParSlug(slug);
  return carteOg({
    emoji: article?.emoji ?? '🚩',
    titre: article?.titre ?? 'Red or Green',
    sous: article ? 'Ce que les votes disent des red flags — un article Red or Green' : '',
    chemin: `/articles/${slug}`,
    teinte: '#F59E0B',
  });
}
