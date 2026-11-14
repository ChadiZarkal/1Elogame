import type { Metadata } from 'next';
import { HubClient } from '../HubClient';
import { getPublicStats } from '@/lib/repositories';
import { withPrerenderTimeout } from '@/lib/prerenderTimeout';

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'Red or Green — free Red Flag Test and red flag games' },
  alternates: { canonical: '/en' },
};

/**
 * L'accueil en anglais. Même vitrine que l'accueil français (`app/page.tsx`),
 * sans le palmarès ni la bande des comportements : ils viennent du « pire des
 * deux », dont le contenu est en français.
 */
export default async function HomeEnPage() {
  const stats = await withPrerenderTimeout(getPublicStats()).catch(() => null);
  return (
    <HubClient
      langue="en"
      articles={[]}
      votes={stats?.totalVotes ?? null}
      comportementsClasses={null}
      pires={[]}
      bande={{ rouges: [], verts: [] }}
    />
  );
}
