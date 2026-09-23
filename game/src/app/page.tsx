/**
 * @module app/page
 * Accueil.
 *
 * Composant serveur. Il lit deux choses dans la base et les passe à la
 * vitrine : le compte des votes, et les trois comportements les plus mal
 * jugés.
 *
 * C'est le point qui manquait à cette page. Elle affirmait que « ce sont les
 * joueurs qui tranchent » sans jamais montrer ce qu'ils avaient tranché : le
 * seul contenu réel de l'accueil était un bandeau défilant d'exemples écrits à
 * la main, décoratif, à 15 % d'opacité derrière une carte. Le site produit
 * pourtant un classement — c'est son produit. Le mettre ici coûte une requête
 * régénérée toutes les cinq minutes et remplit un HTML qui, jusqu'ici, ne
 * contenait quasiment aucun texte indexable au-dessus des notes de bas de
 * page.
 *
 * Le motif est celui de `/classement` et `/observatoire` : `revalidate`, un
 * plafond de temps sur la requête, et un repli silencieux. Si la base ne
 * répond pas, les blocs concernés ne sont pas rendus — la page reste entière
 * et rien n'affiche de zéro ni de gabarit vide.
 */

import { HubClient } from './HubClient';
import { PageNotes } from '@/components/content/PageNotes';
import { HOME_NOTES } from '@/content/page-notes';
import { getPublicStats } from '@/lib/repositories';
import { getLeaderboardPage } from '@/lib/leaderboard';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';

/** Cinq minutes, comme le classement : ces chiffres n'ont pas à être frais. */
export const revalidate = 300;

/** Combien de comportements on montre. Trois : la preuve, pas la liste. */
const APERCU = 3;

export default async function HomePage() {
  let votes: number | null = null;
  let classes: number | null = null;
  let pires: { rang: number; texte: string; votes: number }[] = [];

  try {
    const [stats, palmares] = await Promise.all([
      withPrerenderTimeout(getPublicStats()),
      withPrerenderTimeout(getLeaderboardPage({ sort: 'desc', limit: APERCU, offset: 0 })),
    ]);
    votes = stats.totalVotes;
    classes = palmares.totalElements;
    pires = palmares.rankings.map((r) => ({
      rang: r.rank,
      texte: r.texte,
      votes: r.nb_participations,
    }));
  } catch {
    /* Base indisponible : la vitrine se rend sans ces blocs. */
  }

  return (
    <>
      <HubClient votes={votes} comportementsClasses={classes} pires={pires} />
      <PageNotes notes={HOME_NOTES} />
    </>
  );
}
