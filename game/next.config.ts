import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // `/redflag` ne portait qu'un titre et un bouton menant à `/jeu` : une
      // page de porte, sans contenu propre, que les consignes qualité de Google
      // désignent explicitement. Redirigée en permanent plutôt que supprimée,
      // pour conserver les liens entrants existants.
      { source: '/redflag', destination: '/jeu', permanent: true },
    ];
  },

  // Redirect trailing slashes
  trailingSlash: false,
};

export default nextConfig;
