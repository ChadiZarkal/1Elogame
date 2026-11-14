/**
 * @module classement/PageClassement
 * Le classement, rendu côté serveur, commun à `/classement` et
 * `/en/classement`. En anglais, les comportements sont traduits par le serveur
 * (`lib/jeu/traduction`) et la lecture éditoriale (`ClassementEditorial`, des
 * `PageNotes` pas encore traduites) n'est pas rendue.
 */

import { getLeaderboardPage, type LeaderboardData } from '@/lib/leaderboard';
import { LeaderboardClient } from './LeaderboardClient';
import { ClassementEditorial } from './ClassementEditorial';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { cheminLocalise, type Langue } from '@/lib/i18n/langue';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

const EMPTY_LEADERBOARD: LeaderboardData = {
  rankings: [],
  totalElements: 0,
  visibleElements: 0,
  visibleVotes: 0,
  limit: 30,
  offset: 0,
  hasMore: false,
};

const LISTE = {
  fr: {
    name: 'Classement des red flags — les comportements les plus mal jugés',
    description:
      'Classement des comportements jugés les plus problématiques, établi par les votes de la communauté Red or Green selon un score Elo.',
  },
  en: {
    name: 'Red flag rankings — the most harshly judged behaviors',
    description:
      'Ranking of the behaviors judged most problematic, built from the Red or Green community’s votes using an Elo score.',
  },
};

export async function PageClassement({ langue }: { langue: Langue }) {
  let initialData = EMPTY_LEADERBOARD;

  try {
    initialData = await withPrerenderTimeout(
      getLeaderboardPage({ sort: 'desc', limit: 30, offset: 0, langue }),
    );
  } catch {
    // Base indisponible au build ou à la régénération : le composant client
    // refera la requête côté navigateur plutôt que de faire échouer la page.
  }

  const rows = initialData.rankings;

  // Le balisage ne décrit que les lignes réellement présentes dans le HTML.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: LISTE[langue].name,
    description: LISTE[langue].description,
    url: `${SITE_URL}${cheminLocalise(langue, '/classement')}`,
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
      {/* Sous le classement : de quoi lire les chiffres sans quitter la page.
          En français seulement tant que ces notes ne sont pas traduites. */}
      {langue === 'fr' && (
        <ClassementEditorial
          totalElements={initialData.totalElements}
          totalVotes={initialData.visibleVotes}
          top={rows.slice(0, 3)}
        />
      )}
    </>
  );
}
