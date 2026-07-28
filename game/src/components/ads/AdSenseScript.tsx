'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Routes sur lesquelles le script AdSense ne doit jamais être chargé :
 * panneaux d'administration et pages d'état éphémère sans contenu éditeur.
 *
 * Le règlement « Valeur de l'inventaire » interdit les annonces sur les écrans
 * sans contenu de l'éditeur — avec les annonces automatiques activées, la seule
 * présence du script suffit à en faire apparaître.
 */
const BLOCKED_PATHS = [
  /^\/admin(\/|$)/,
  /^\/dixmais\/admin(\/|$)/,
  /^\/jeu\/recap(\/|$)/,
  /^\/flashflag\/session(\/|$)/,
];

interface AdSenseScriptProps {
  clientId: string;
}

export function AdSenseScript({ clientId }: AdSenseScriptProps) {
  const pathname = usePathname() ?? '';

  if (!clientId) return null;
  if (BLOCKED_PATHS.some((re) => re.test(pathname))) return null;

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
