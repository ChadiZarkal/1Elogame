import type { Metadata } from 'next';

/**
 * Le front-end de référence, chargé tel quel.
 *
 * `flac.css` et `reset.css` sont les feuilles d'origine de
 * ChadiZarkal/redorgreenorigin, recopiées sans un octet de différence dans
 * `public/rft/css/`. Leurs `url("../fnt/…")` et `url("../img/…")` se résolvent
 * parce que l'arborescence `flac-resources` a gardé sa forme — le fichier n'a
 * donc besoin d'aucune retouche, et remplacer la feuille par une version plus
 * récente est une simple écrasure, jamais une fusion.
 *
 * Chargées en `<link>` plutôt qu'importées : un import ferait réécrire les URL
 * d'assets par Next, et la copie cesserait d'être conforme. Comme les balises
 * vivent dans ce layout, la feuille ne s'applique qu'aux routes
 * `/redflagtest` — ses règles `:root` et `html body` n'atteignent jamais le
 * reste du site.
 */

export const metadata: Metadata = {
  title: 'Red Flag Test',
  description: 'Maquette du test — le front-end seul, sans calcul réel.',
  // Une maquette n'a rien à faire dans un index de moteur de recherche.
  robots: { index: false, follow: false },
};

export default function RedflagtestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable @next/next/no-css-tags -- délibéré : un import ferait
          réécrire les URL d'assets par Next, or tout l'intérêt est que la
          feuille de référence reste identique à l'octet près. */}
      <link rel="stylesheet" href="/rft/css/reset.css" />
      <link rel="stylesheet" href="/rft/css/flac.css" />
      {/* La nôtre : elle répare ce que l'application hôte casse. Voir l'en-tête
          du fichier. */}
      <link rel="stylesheet" href="/rft/adapter.css" />
      {/* eslint-enable @next/next/no-css-tags */}
      {children}
    </>
  );
}
