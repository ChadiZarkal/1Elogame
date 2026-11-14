/**
 * @module redflagtest/FeuillesRft
 * Les trois feuilles du Red Flag Test, partagées par la version française
 * (`app/redflagtest/layout.tsx`) et la version anglaise
 * (`app/en/redflagtest/layout.tsx`). Le pourquoi des `<link>` et de
 * l'empreinte est écrit dans le layout français.
 */

/** L'empreinte du contenu des trois feuilles, calculée au build (`next.config.ts`). */
const VERSION_FEUILLES = process.env.RFT_VERSION_FEUILLES ?? 'dev';

const feuille = (chemin: string) => `${chemin}?v=${VERSION_FEUILLES}`;

export function FeuillesRft() {
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
    </>
  );
}
