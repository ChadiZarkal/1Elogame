import type { Metadata } from 'next';
import { PageSources } from '@/app/sources/PageSources';

/** Les sources en anglais. Voir `app/sources/page.tsx`. */
export const metadata: Metadata = {
  title: 'Sources — what our tools are based on',
  description:
    'Red or Green’s self-assessment tools rely on scales produced by French public institutions and specialized nonprofits. References and limits.',
  alternates: { canonical: '/en/sources' },
  openGraph: { locale: 'en_US', url: '/en/sources' },
};

export default function SourcesEnPage() {
  return <PageSources langue="en" />;
}
