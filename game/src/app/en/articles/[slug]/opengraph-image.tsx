import { carteOg, TAILLE_OG } from '@/lib/carteOg';
import { ARTICLES_EN, articleParSlug } from '@/content/articles';

export const size = TAILLE_OG;
export const contentType = 'image/png';
export const alt = 'Article — Red or Green';

export function generateStaticParams() {
  return ARTICLES_EN.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleParSlug(slug, 'en');
  return carteOg({
    emoji: article?.emoji ?? '🚩',
    titre: article?.titre ?? 'Red or Green',
    sous: article ? 'What the votes say about red flags — a Red or Green article' : '',
    chemin: `/en/articles/${slug}`,
    teinte: '#F59E0B',
  });
}
