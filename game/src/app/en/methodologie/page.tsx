import type { Metadata } from 'next';
import { PageMethodologie } from '@/app/methodologie/PageMethodologie';

/** La méthodologie en anglais. Voir `app/methodologie/page.tsx`. */
export const metadata: Metadata = {
  title: 'Methodology — how we rank red flags',
  description:
    'The Red or Green ranking runs on an Elo score fed by community votes. How it works, sample size, the biases we own up to, and its limits.',
  alternates: { canonical: '/en/methodologie' },
  openGraph: { locale: 'en_US', url: '/en/methodologie' },
};

export const revalidate = 3600;

export default async function MethodologieEnPage() {
  return PageMethodologie({ langue: 'en' });
}
