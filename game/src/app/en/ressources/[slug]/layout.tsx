import type { Metadata } from 'next';
import { METERS_EN } from '@/config/meters-data-en';
import { MeterFaqAndLinks, MeterJsonLd, metadonneesOutil } from '@/app/ressources/[slug]/annexes';

/**
 * Un outil d'auto-évaluation en anglais. Pendant de
 * `app/ressources/[slug]/layout.tsx` : mêmes slugs, mêmes composants, dans la
 * langue anglaise.
 */

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  return METERS_EN.map((meter) => ({ slug: meter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadonneesOutil('en', slug);
}

export default async function MeterEnLayout({ params, children }: Props) {
  const { slug } = await params;
  return (
    <>
      <MeterJsonLd slug={slug} langue="en" />
      {children}
      <MeterFaqAndLinks slug={slug} langue="en" />
    </>
  );
}
