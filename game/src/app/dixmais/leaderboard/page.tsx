/**
 * @module dixmais/leaderboard/page
 *
 * Le classement est régénéré côté serveur : la page figure au sitemap, elle
 * doit donc livrer ses lignes dans le HTML plutôt qu'un indicateur de
 * chargement. Même dispositif que `/classement`.
 */

import { getDixMaisLeaderboard } from '@/lib/repositories/dixmais';
import LeaderboardClient, { type LeaderboardEntry } from './LeaderboardClient';

export const revalidate = 300;

export default async function DixMaisLeaderboardPage() {
  let initialData: LeaderboardEntry[] = [];

  try {
    initialData = await getDixMaisLeaderboard(100);
  } catch {
    // Base indisponible à la régénération : le composant client refera la
    // requête côté navigateur plutôt que de faire échouer la page.
  }

  return <LeaderboardClient initialData={initialData} />;
}
