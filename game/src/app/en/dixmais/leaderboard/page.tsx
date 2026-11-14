/**
 * Le classement de « It's a 10 but… », rendu côté serveur comme
 * `app/dixmais/leaderboard/page.tsx`. Les lignes sont réunies par texte
 * français, puis traduites : les notes sont celles de la version française.
 */

import { getDixMaisLeaderboard } from '@/lib/repositories/dixmais';
import LeaderboardClient, { type LeaderboardEntry } from '@/app/dixmais/leaderboard/LeaderboardClient';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { traduireEnonces } from '@/lib/dixmais/traduction';

export const revalidate = 300;

export default async function DixMaisLeaderboardEnPage() {
  let initialData: LeaderboardEntry[] = [];

  try {
    initialData = traduireEnonces(await withPrerenderTimeout(getDixMaisLeaderboard(100)), 'en');
  } catch {
    // Base indisponible à la régénération : le composant client refera la
    // requête côté navigateur plutôt que de faire échouer la page.
  }

  return <LeaderboardClient initialData={initialData} />;
}
