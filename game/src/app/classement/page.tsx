import { getLeaderboardPage, type LeaderboardData } from '@/lib/leaderboard';
import { LeaderboardClient } from './LeaderboardClient';

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

  return <LeaderboardClient initialData={initialData} />;
}
