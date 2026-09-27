/**
 * @module app/page
 * Accueil.
 *
 * Composant serveur. Il lit trois choses dans la base et les passe à la
 * vitrine : le compte des votes, les comportements les plus mal jugés et les
 * moins mal jugés — ces deux listes nourrissent le bandeau défilant et le
 * podium.
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

/** Le podium : trois, la preuve et non la liste. */
const PODIUM = 3;
/**
 * Le bandeau défilant : assez de comportements pour qu'une boucle ne se lise
 * pas comme une répétition, pas plus. Pris aux deux bouts du classement — ce
 * que les joueurs jugent le plus grave, et le moins.
 */
const BANDE = 8;

type Ligne = { rang: number; texte: string; votes: number };

export default async function HomePage() {
  // `allSettled` et non `all` : chaque bloc de la vitrine vit de sa propre
  // requête. Un compteur de votes en panne ne doit pas emporter le classement.
  const [stats, pires, moinsGraves] = await Promise.allSettled([
    withPrerenderTimeout(getPublicStats()),
    withPrerenderTimeout(getLeaderboardPage({ sort: 'desc', limit: BANDE, offset: 0 })),
    withPrerenderTimeout(getLeaderboardPage({ sort: 'asc', limit: BANDE, offset: 0 })),
  ]);

  const votes = stats.status === 'fulfilled' ? stats.value.totalVotes : null;
  const classes = pires.status === 'fulfilled' ? pires.value.totalElements : null;
  const lignes: Ligne[] =
    pires.status === 'fulfilled'
      ? pires.value.rankings.map((r) => ({ rang: r.rank, texte: r.texte, votes: r.nb_participations }))
      : [];
  const verts =
    moinsGraves.status === 'fulfilled' ? moinsGraves.value.rankings.map((r) => r.texte) : [];

  return (
    <>
      <HubClient
        votes={votes}
        comportementsClasses={classes}
        pires={lignes.slice(0, PODIUM)}
        bande={{
          rouges: lignes.map((l) => l.texte),
          // Un comportement ne figure jamais dans les deux rangées : sur un
          // classement court, les deux bouts se rejoignent.
          verts: verts.filter((t) => !lignes.some((l) => l.texte === t)),
        }}
      />
      <PageNotes notes={HOME_NOTES} />
    </>
  );
}
