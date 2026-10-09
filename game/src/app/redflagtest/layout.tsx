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
 *
 * LEUR ADRESSE PORTE LA VERSION DU DÉPLOIEMENT
 *   Contrairement aux fichiers de Next, ces feuilles n'ont pas d'empreinte dans
 *   leur nom, et le service worker sert ce genre de fichier depuis son cache
 *   avant de le rafraîchir (`public/sw.js`). Après la mise en ligne des
 *   stories, un navigateur qui avait déjà visité le test recevait le nouveau
 *   HTML avec l'ANCIENNE `adapter.css` : les stories s'affichaient sans mise en
 *   forme, sous la page, et leur grand logo passait pour une seconde barre du
 *   site. L'adresse porte désormais l'empreinte de leur contenu : elle change
 *   dès qu'une feuille change, et un cache périmé ne peut plus la servir.
 */

/** L'empreinte du contenu des trois feuilles, calculée au build (`next.config.ts`). */
const VERSION_FEUILLES = process.env.RFT_VERSION_FEUILLES ?? 'dev';

const feuille = (chemin: string) => `${chemin}?v=${VERSION_FEUILLES}`;

export const metadata: Metadata = {
  // « red flag test » est la requête visée : en tête, tel qu'on le tape.
  title: 'Red Flag Test gratuit : es-tu un red flag ?',
  description:
    'Fais le Red Flag Test, gratuit et anonyme : découvre ton score de red flag en pourcentage, ton profil et ta place parmi les autres joueurs. Sans inscription.',
  keywords: ['red flag test', 'redflag test', 'test red flag', 'es-tu un red flag', 'red flag'],
  openGraph: {
    title: 'Red Flag Test : es-tu un red flag ?',
    description: 'Le test gratuit et anonyme : ton score de red flag en pourcentage, et ta place parmi les autres.',
    url: '/redflagtest',
  },
  /*
   * Ouvert aux moteurs : le questionnaire est écrit. Il était fermé tant que
   * la page n'aurait annoncé que « le test n'a pas encore de questions ».
   *
   * L'adresse canonique est indispensable, pas décorative. Le layout racine
   * déclare `canonical: '/'`, dont hérite toute route qui ne dit rien : sans
   * cette ligne, /redflagtest se présenterait à Google comme un doublon de
   * l'accueil, et lever le `noindex` n'aurait rien changé. Les autres jeux
   * déclarent tous la leur, pour la même raison.
   *
   * Les résultats partagés (`r/[code]`) restent fermés : ils portent leur
   * propre règle, qui prime sur celle-ci.
   */
  alternates: { canonical: '/redflagtest' },
};

export default function RedflagtestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Des <link> et non des imports, délibérément : un import ferait
          réécrire les URL d'assets par Next, or tout l'intérêt est que la
          feuille de référence reste identique à l'octet près. */}
      <link rel="stylesheet" href={feuille('/rft/css/reset.css')} />
      <link rel="stylesheet" href={feuille('/rft/css/flac.css')} />
      {/* La nôtre : elle répare ce que l'application hôte casse. Voir l'en-tête
          du fichier. */}
      <link rel="stylesheet" href={feuille('/rft/adapter.css')} />
      {children}
    </>
  );
}
