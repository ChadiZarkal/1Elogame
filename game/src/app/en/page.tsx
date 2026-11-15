import type { Metadata } from 'next';
import { HubClient } from '../HubClient';
import { PageNotes } from '@/components/content/PageNotes';
import { HOME_NOTES_EN } from '@/content/page-notes-en';
import { getPublicStats } from '@/lib/repositories';
import { getLeaderboardPage } from '@/lib/leaderboard';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';
import { traduireElement } from '@/lib/jeu/traduction';
import { alternances } from '@/lib/i18n/alternances';
import { chargerTraductions } from '@/lib/i18n/traductionsBase';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'Red or Green — free Red Flag Test and red flag games' },
  alternates: alternances('en', '/'),
};

const PODIUM = 3;
const BANDE = 8;

/**
 * L'accueil en anglais. Même vitrine et mêmes données que l'accueil français
 * (`app/page.tsx`, voir ses commentaires) : les comportements du palmarès
 * sont traduits par le dictionnaire du « pire des deux » (`lib/jeu/traduction`).
 * Les articles ne sont pas passés : la section « À lire » est masquée dans les
 * deux langues.
 */
export default async function HomeEnPage() {
  const [stats, pires, moinsGraves] = await Promise.allSettled([
    withPrerenderTimeout(getPublicStats()),
    withPrerenderTimeout(getLeaderboardPage({ sort: 'desc', limit: BANDE, offset: 0 })),
    withPrerenderTimeout(getLeaderboardPage({ sort: 'asc', limit: BANDE, offset: 0 })),
    chargerTraductions('jeu'),
  ]);

  const en = (texte: string) => traduireElement(texte, 'en');
  const lignes =
    pires.status === 'fulfilled'
      ? pires.value.rankings.map((r) => ({ rang: r.rank, texte: en(r.texte), votes: r.nb_participations }))
      : [];
  const verts =
    moinsGraves.status === 'fulfilled' ? moinsGraves.value.rankings.map((r) => en(r.texte)) : [];

  return (
    <>
      <HubClient
        langue="en"
        articles={[]}
        votes={stats.status === 'fulfilled' ? stats.value.totalVotes : null}
        comportementsClasses={pires.status === 'fulfilled' ? pires.value.totalElements : null}
        pires={lignes.slice(0, PODIUM)}
        bande={{
          rouges: lignes.map((l) => l.texte),
          verts: verts.filter((t) => !lignes.some((l) => l.texte === t)),
        }}
      />
      <PageNotes notes={HOME_NOTES_EN} langue="en" />
    </>
  );
}
