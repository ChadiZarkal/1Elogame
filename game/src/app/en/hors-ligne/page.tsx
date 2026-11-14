import type { Metadata } from 'next';
import Link from '@/components/ui/LienIntention';
import { cheminLocalise } from '@/lib/i18n/langue';

/**
 * La page hors ligne en anglais. Mêmes contraintes que la française
 * (`app/hors-ligne/page.tsx`) : aucune dépendance réseau ni donnée.
 *
 * Le service worker (`public/sw.js`) ne sert pour l'instant que la version
 * française quand une navigation échoue ; il faudrait lui faire servir
 * celle-ci pour les adresses sous `/en`.
 */
export const metadata: Metadata = {
  title: 'Offline',
  description: 'This page needs a connection.',
  robots: { index: false, follow: false },
};

export default function OfflineEnPage() {
  return (
    <main
      id="main-content"
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: 'calc(100dvh - var(--header-h, 3rem))' }}
    >
      <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden className="opacity-25">
        <g fill="#F5F5F7">
          <path d="M0 3.5A3.5 3.5 0 0 1 7 3.5V96.5A3.5 3.5 0 0 1 0 96.5Z" />
          <path d="M3.5 0A5.5 5.5 0 1 1 3.5 11A5.5 5.5 0 0 1 3.5 0Z" />
          <path d="M7 8C34 12 68 20 99 33.5C99 33.5 68 43 7 61Z" />
        </g>
      </svg>

      <h1 className="mt-6 text-2xl font-black tracking-tight text-[#F5F5F7]">
        No connection
      </h1>
      <p className="mt-3 max-w-xs text-sm font-semibold leading-relaxed text-[#A6A6A6]">
        Red or Green needs the network to fetch the duels and the verdicts. Come back as soon as
        you have a signal.
      </p>

      <Link
        href={cheminLocalise('en', '/')}
        className="mt-8 flex min-h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[#F5F5F7] px-6 text-xs font-black uppercase tracking-widest text-black transition-transform active:scale-95"
      >
        Try again
      </Link>
    </main>
  );
}
