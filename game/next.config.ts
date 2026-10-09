import type { NextConfig } from "next";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";

/*
 * L'empreinte des trois feuilles du Red Flag Test, calculée au build.
 *
 * Elles sont servies depuis `public/rft/` sous une adresse fixe, et le service
 * worker sert ce genre de fichier depuis son cache avant de le rafraîchir : un
 * navigateur qui avait déjà visité le test recevait le nouveau HTML avec
 * l'ancienne feuille. Le layout du test ajoute cette empreinte à leur adresse
 * (`?v=…`) : elle change quand une feuille change, et seulement alors.
 *
 * Calculée ici plutôt qu'au rendu : les fonctions serverless de Vercel n'ont
 * pas `public/` dans leur système de fichiers, le build si.
 */
const empreinteFeuillesRft = (() => {
  const hash = createHash("sha256");
  for (const fichier of ["rft/css/reset.css", "rft/css/flac.css", "rft/adapter.css"]) {
    hash.update(readFileSync(path.join(process.cwd(), "public", fichier)));
  }
  return hash.digest("hex").slice(0, 12);
})();

const nextConfig: NextConfig = {
  env: {
    RFT_VERSION_FEUILLES: empreinteFeuillesRft,
  },

  // Performance
  compress: true,
  poweredByHeader: false,

  // Tree-shake barrel imports (lucide-react already optimized by default)
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security + caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        /* `immutable` a été retiré : le manifeste change (icônes, raccourcis,
           couleurs), et un client qui le tenait pour immuable gardait pendant
           24 h une définition d'application périmée — sans moyen de la purger.
           `must-revalidate` laisse le cache servir vite mais revalider. */
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' },
        ],
      },
      {
        /* Le service worker ne doit jamais être servi depuis le cache : une
           version figée continuerait à distribuer l'ancienne coquille
           applicative à tous les visiteurs déjà installés. */
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // www.redorgreen.fr servait le site en 200. Les pages y déclaraient bien
      // redorgreen.fr comme adresse canonique, mais Google devait deviner ;
      // une redirection permanente le lui dit, et regroupe les liens entrants.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.redorgreen.fr' }],
        destination: 'https://redorgreen.fr/:path*',
        permanent: true,
      },
      // `/redflag` ne portait qu'un titre et un bouton menant à `/jeu` : une
      // page de porte, sans contenu propre, que les consignes qualité de Google
      // désignent explicitement. Redirigée en permanent plutôt que supprimée,
      // pour conserver les liens entrants existants. Elle mène au guide, qui
      // définit le terme : quelqu'un qui tape « /redflag » cherche ce que le
      // mot veut dire, pas un duel.
      { source: '/redflag', destination: '/guide', permanent: true },
      // Flash Flag a été retiré : ses tables n'avaient jamais été créées en
      // production, le jeu ne pouvait donc pas fonctionner. Ses liens de
      // session étaient faits pour être envoyés — il en circule forcément.
      // Ils mènent à l'accueil plutôt qu'à une page d'erreur.
      { source: '/flashflag', destination: '/', permanent: true },
      { source: '/flashflag/:path*', destination: '/', permanent: true },
      { source: '/admin/flashflag', destination: '/admin', permanent: true },
    ];
  },

  // Redirect trailing slashes
  trailingSlash: false,
};

export default nextConfig;
