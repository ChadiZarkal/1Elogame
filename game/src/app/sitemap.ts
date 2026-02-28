import type { MetadataRoute } from 'next';
import { METERS } from '@/config/meters-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redflaggames.fr';
  const now = new Date();

  const meterPages: MetadataRoute.Sitemap = METERS.map((meter) => ({
    url: `${baseUrl}/ressources/${meter.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jeu`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/flagornot`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/classement`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/redflag`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ressources`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...meterPages,
  ];
}
