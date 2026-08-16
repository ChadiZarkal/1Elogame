import { getLeaderboardPage, type LeaderboardData } from '@/lib/leaderboard';
import { LeaderboardClient } from './LeaderboardClient';
import { ClassementEditorial } from './ClassementEditorial';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

// Le classement évolue en continu : on le régénère côté serveur au plus toutes
// les 5 minutes. Le HTML servi contient ainsi toujours de vraies données.
export const revalidate = 300;

const EMPTY_LEADERBOARD: LeaderboardData = {
  rankings: [],
  totalElements: 0,
  visibleElements: 0,
  visibleVotes: 0,
  limit: 30,
  offset: 0,
  hasMore: false,
};

export default async function ClassementPage() {
  let initialData = EMPTY_LEADERBOARD;

  try {
    initialData = await getLeaderboardPage({ sort: 'desc', limit: 30, offset: 0 });
  } catch {
    // Base indisponible au build ou à la régénération : le composant client
    // refera la requête côté navigateur plutôt que de faire échouer la page.
  }

  const rows = initialData.rankings;

  // Le balisage ne décrit que les lignes réellement présentes dans le HTML.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Classement des red flags — les comportements les plus mal jugés',
    description:
      'Classement des comportements jugés les plus problématiques, établi par les votes de la communauté Red or Green selon un score Elo.',
    url: `${SITE_URL}/classement`,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: rows.length,
    itemListElement: rows.map((row) => ({
      '@type': 'ListItem',
      position: row.rank,
      name: row.texte,
    })),
  };

  return (
    <>
      {rows.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <LeaderboardClient initialData={initialData} />
      {/* Sous le classement : de quoi lire les chiffres sans quitter la page. */}
      <ClassementEditorial
        totalElements={initialData.totalElements}
        totalVotes={initialData.visibleVotes}
        top={rows.slice(0, 3)}
      />
    </>
  );
}
