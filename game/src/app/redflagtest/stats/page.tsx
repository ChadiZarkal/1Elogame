import type { Metadata } from 'next';
import Link from 'next/link';
import { StatsClient } from './StatsClient';

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

export default function PageStats() {
  return (
    <main className="main-container redflagtest statistiques" id="main-content">
      <div className="client-container">
        <header className="site-header">
          {/* Pas de logo : la barre du site le porte déjà (voir page.tsx). */}
          <h1 className="site-tagline">Red Flag Test : ce que les autres ont répondu</h1>
        </header>
        {/* Rendu serveur : les chiffres sont chargés par le navigateur, et le
            HTML de cette page se réduisait sans cela à dix-sept mots. */}
        <p className="rft-stats-intro">
          Pour chaque question du <Link href="/redflagtest">Red Flag Test</Link>,
          ce que les joueurs ont répondu, et l&apos;écart entre les réponses des
          hommes et celles des femmes. Les chiffres se mettent à jour à chaque
          partie terminée.
        </p>
        <StatsClient />
      </div>
    </main>
  );
}
