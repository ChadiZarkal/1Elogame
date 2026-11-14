import type { Metadata } from 'next';
import { PageStats } from './PageStats';

export const metadata: Metadata = {
  // `absolute` : le layout de /redflagtest déclare son propre titre, ce qui
  // coupe le gabarit « … | Red or Green » du layout racine pour ses enfants.
  title: { absolute: 'Red Flag Test : les réponses des joueurs | Red or Green' },
  description:
    'Les réponses du Red Flag Test, question par question, et l’écart entre les hommes et les femmes.',
  // Sa propre adresse, sinon elle hériterait de celle du test et se
  // déclarerait doublon de /redflagtest.
  alternates: { canonical: '/redflagtest/stats' },
};

export default function Page() {
  return <PageStats langue="fr" />;
}
