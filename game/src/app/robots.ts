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
          '/classement',
          '/redflag',
          '/ressources',
          '/ressources/violentometre',
          '/ressources/consentometre',
          '/ressources/incestometre',
          '/ressources/harcelometre',
          '/ressources/discriminometre',
        ],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
