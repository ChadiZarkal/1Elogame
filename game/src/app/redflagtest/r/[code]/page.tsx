import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lireResultatParCode } from '@/lib/rft/repository';
import { ResultatPartage } from './ResultatPartage';

export const dynamic = 'force-dynamic';

/**
 * La page d'un résultat partagé.
 *
 * Rendue sur le serveur pour une raison précise : c'est la seule façon que
 * l'aperçu du lien — celui qui s'affiche dans une conversation — porte le score
 * et l'archétype. Une page client afficherait le titre générique du site, et
 * personne ne cliquerait.
 */
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> },
): Promise<Metadata> {
  const { code } = await params;
  const resultat = await lireResultatParCode(code).catch(() => null);

  if (!resultat) return { title: 'Résultat introuvable', robots: { index: false } };

  const titre = resultat.archetype
    ? `${resultat.score} % red flag — ${resultat.archetype.titre}`
    : `${resultat.score} % red flag`;

  return {
    title: titre,
    description: 'Devine son score avant de le voir, puis fais le test.',
    // Un résultat individuel n'a rien à faire dans un index : il n'apporte rien
    // à quelqu'un qui cherche le jeu, et il expose une partie sans que son
    // auteur l'ait demandé.
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: 'Devine son score avant de le voir.' },
    twitter: { card: 'summary_large_image', title: titre },
  };
}

export default async function PagePartage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const resultat = await lireResultatParCode(code).catch(() => null);
  if (!resultat) notFound();

  return (
    <main className="main-container redflagtest" id="main-content">
      <div className="client-container">
        <header className="site-header">
          <Link href="/redflagtest" className="logo-link">
            {/* eslint-disable-next-line @next/next/no-img-element -- markup de
                référence : `flac.css` dimensionne l'image via .logo-image. */}
            <img className="logo-image" src="/rft/img/logo-rog.svg" alt="Red or Green" />
          </Link>
          <h1 className="site-tagline">Quelqu’un t’a envoyé son résultat.</h1>
        </header>
        <ResultatPartage resultat={resultat} />
      </div>
    </main>
  );
}
