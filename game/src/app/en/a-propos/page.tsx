import type { Metadata } from 'next';
import { PageAPropos } from '@/app/a-propos/PageAPropos';

/** « À propos » en anglais. Voir `app/a-propos/page.tsx`. */
export const metadata: Metadata = {
  title: 'About — who runs Red or Green, and why',
  description:
    'Red or Green is a site of games about relationship behaviors, alongside self-assessment tools based on official sources. Our approach, our limits, our principles.',
  alternates: { canonical: '/en/a-propos' },
  openGraph: { locale: 'en_US', url: '/en/a-propos' },
};

export default function AProposEnPage() {
  return <PageAPropos langue="en" />;
}
