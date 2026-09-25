import type { Metadata } from 'next';
import Link from 'next/link';
import { StatsClient } from './StatsClient';

export const metadata: Metadata = {
  title: 'Ce que les autres ont répondu',
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
          <Link href="/redflagtest" className="logo-link">
            {/* eslint-disable-next-line @next/next/no-img-element -- markup de
                référence : `flac.css` dimensionne l'image via .logo-image. */}
            <img className="logo-image" src="/rft/img/logo-rog.svg" alt="Red or Green" />
          </Link>
          <h1 className="site-tagline">Ce que les autres ont répondu</h1>
        </header>
        <StatsClient />
      </div>
    </main>
  );
}
