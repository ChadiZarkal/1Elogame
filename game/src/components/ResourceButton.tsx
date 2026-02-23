'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

/**
 * Floating "Ressources" button displayed in the bottom-right corner
 * on all pages except the /ressources pages themselves.
 */
export function ResourceButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the button on /ressources pages (already there)
  if (pathname.startsWith('/ressources')) return null;

  return (
    <button
      onClick={() => router.push('/ressources')}
      className="res-fab"
      aria-label="Accéder aux ressources d'aide"
      title="Ressources & aide"
    >
      <Shield size={14} strokeWidth={2.5} />
      <span className="res-fab__label">Besoin d&apos;aide ?</span>
    </button>
  );
}
