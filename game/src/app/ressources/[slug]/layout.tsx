import type { Metadata } from 'next';
import { METERS } from '@/config/meters-data';
import { MeterFaqAndLinks, MeterJsonLd, metadonneesOutil } from './annexes';

/* Le balisage, la notice, la FAQ et les liens vivent dans `annexes.tsx`,
   partagé avec la version anglaise (`/en/ressources/[slug]`). */

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  return METERS.map((meter) => ({ slug: meter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadonneesOutil('fr', slug);
}

export default async function MeterLayout({ params, children }: Props) {
  const { slug } = await params;
  return (
    <>
      <MeterJsonLd slug={slug} langue="fr" />
      {children}
      {/* Placé sous l'outil : le contenu éditorial ne doit pas s'intercaler
          avant l'usage, mais il doit être présent et visible dans le HTML. */}
      <MeterFaqAndLinks slug={slug} langue="fr" />
    </>
  );
}
