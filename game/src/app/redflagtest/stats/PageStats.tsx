/**
 * @module redflagtest/stats/PageStats
 * Les réponses des joueurs, dans les deux langues (`/redflagtest/stats`,
 * `/en/redflagtest/stats`).
 */

import Link from '@/components/ui/LienIntention';
import type { Langue } from '@/lib/i18n/langue';
import { StatsClient } from './StatsClient';

export function PageStats({ langue }: { langue: Langue }) {
  const en = langue === 'en';
  return (
    <main className="main-container redflagtest statistiques" id="main-content">
      <div className="client-container">
        <header className="site-header">
          {/* Pas de logo : la barre du site le porte déjà (voir page.tsx). */}
          <h1 className="site-tagline">
            {en ? 'Red Flag Test: what everyone else answered' : 'Red Flag Test : ce que les autres ont répondu'}
          </h1>
        </header>
        {/* Rendu serveur : les chiffres sont chargés par le navigateur, et le
            HTML de cette page se réduisait sans cela à dix-sept mots. */}
        {en ? (
          <p className="rft-stats-intro">
            For each question of the <Link href="/en/redflagtest">Red Flag Test</Link>,
            what players answered, and the gap between men’s and women’s answers.
            The numbers update after every finished game.
          </p>
        ) : (
          <p className="rft-stats-intro">
            Pour chaque question du <Link href="/redflagtest">Red Flag Test</Link>,
            ce que les joueurs ont répondu, et l&apos;écart entre les réponses des
            hommes et celles des femmes. Les chiffres se mettent à jour à chaque
            partie terminée.
          </p>
        )}
        <StatsClient />
      </div>
    </main>
  );
}
