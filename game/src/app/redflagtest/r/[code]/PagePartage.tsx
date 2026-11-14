/**
 * @module redflagtest/r/[code]/PagePartage
 * La page d'un résultat partagé, dans les deux langues
 * (`/redflagtest/r/…`, `/en/redflagtest/r/…`).
 *
 * Rendue sur le serveur pour une raison précise : c'est la seule façon que
 * l'aperçu du lien — celui qui s'affiche dans une conversation — porte le score
 * et l'archétype. Une page client afficherait le titre générique du site, et
 * personne ne cliquerait.
 *
 * La partie n'a pas de langue : le même code s'ouvre en français ou en
 * anglais selon l'adresse, et le résultat est traduit à l'affichage.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lireResultatParCode } from '@/lib/rft/repository';
import { traduireResultat } from '@/lib/rft/traduction';
import type { Langue } from '@/lib/i18n/langue';
import { TEXTES_RFT } from '../../textes';
import { ResultatPartage } from './ResultatPartage';

const META = {
  fr: {
    introuvable: 'Résultat introuvable',
    description: 'Devine son score avant de le voir, puis fais le test.',
    og: 'Devine son score avant de le voir.',
  },
  en: {
    introuvable: 'Result not found',
    description: 'Guess their score before you see it, then take the test.',
    og: 'Guess their score before you see it.',
  },
} satisfies Record<Langue, Record<string, string>>;

export async function metadataPartage(code: string, langue: Langue): Promise<Metadata> {
  const brut = await lireResultatParCode(code).catch(() => null);
  const m = META[langue];

  if (!brut) return { title: m.introuvable, robots: { index: false } };
  const resultat = traduireResultat(brut, langue);

  const score = TEXTES_RFT[langue].pct(resultat.score);
  const titre = resultat.archetype
    ? `${score} red flag — ${resultat.archetype.titre}`
    : `${score} red flag`;

  return {
    title: titre,
    description: m.description,
    // Un résultat individuel n'a rien à faire dans un index : il n'apporte rien
    // à quelqu'un qui cherche le jeu, et il expose une partie sans que son
    // auteur l'ait demandé.
    robots: { index: false, follow: false },
    openGraph: { title: titre, description: m.og },
    twitter: { card: 'summary_large_image', title: titre },
  };
}

export async function PagePartage({ code, langue }: { code: string; langue: Langue }) {
  const brut = await lireResultatParCode(code).catch(() => null);
  if (!brut) notFound();
  const resultat = traduireResultat(brut, langue);

  return (
    <main className="main-container redflagtest" id="main-content">
      <div className="client-container">
        <header className="site-header">
          {/* Pas de logo : la barre du site le porte déjà (voir page.tsx). */}
          <h1 className="site-tagline">{TEXTES_RFT[langue].partageTitrePage}</h1>
        </header>
        <ResultatPartage resultat={resultat} />
      </div>
    </main>
  );
}
