import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redorgreen.fr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/jeu',
          '/flagornot',
          '/flashflag',
          '/guide',
          '/classement',
          '/redflag',
          '/dixmais',
          '/dixmais/leaderboard',
          '/ressources',
          '/observatoire',
          '/a-propos',
          '/methodologie',
          '/sources',
          '/ressources/violentometre',
          '/ressources/consentometre',
          '/ressources/incestometre',
          '/ressources/harcelometre',
          '/ressources/discriminometre',
          '/cgu',
          '/mentions-legales',
          '/confidentialite',
        ],
        // Les pages d'état éphémère (/jeu/recap, /flashflag/session/*) ne sont
        // pas listées ici : elles portent un `noindex` en métadonnées, que
        // Google doit pouvoir explorer pour le prendre en compte.
        disallow: ['/admin', '/admin/', '/dixmais/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
