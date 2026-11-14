import type { Metadata } from 'next';
import { metadataPartage, PagePartage } from '@/app/redflagtest/r/[code]/PagePartage';

export const dynamic = 'force-dynamic';

/** La page d'un résultat partagé, en anglais. Voir `PagePartage`. */
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> },
): Promise<Metadata> {
  const { code } = await params;
  return metadataPartage(code, 'en');
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PagePartage code={code} langue="en" />;
}
