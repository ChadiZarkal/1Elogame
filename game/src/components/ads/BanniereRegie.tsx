'use client';

/**
 * @module components/ads/BanniereRegie
 * Une bannière Adsterra à format fixe (320×50, 300×250…), dans son propre
 * document (iframe `srcdoc`).
 *
 * Le code de la régie déclare une variable globale `atOptions`, puis charge
 * son script, qui la lit et écrit la bannière à côté de lui. Deux bannières
 * dans un même document se disputeraient cette variable, et le site ne
 * recharge jamais la page : chaque bannière a donc son document, comme les
 * encarts natifs (voir `CadreRegie`).
 *
 * Le cadre a la taille exacte du format : rien ne bouge autour quand
 * l'annonce arrive, ni quand elle n'arrive pas.
 */

import { useEffect, useRef } from 'react';
import type { BanniereUnit } from '@/config/ads';

/** Le document du cadre : le code tel que la régie le fournit. */
export function documentBanniere(unit: BanniereUnit): string {
  const options = JSON.stringify({
    key: unit.key,
    format: 'iframe',
    height: unit.hauteur,
    width: unit.largeur,
    params: {},
  });
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<style>html,body{margin:0;background:transparent;overflow:hidden}</style>
</head><body>
<script>atOptions = ${options};</script>
<script data-cfasync="false" src="${unit.src}"></script>
</body></html>`;
}

export function BanniereRegie({ unit, className = '' }: { unit: BanniereUnit; className?: string }) {
  const cadre = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (cadre.current) cadre.current.srcdoc = documentBanniere(unit);
  }, [unit]);

  return (
    <iframe
      ref={cadre}
      title="Publicité"
      width={unit.largeur}
      height={unit.hauteur}
      scrolling="no"
      className={`block border-0 ${className}`.trim()}
      style={{ width: unit.largeur, height: unit.hauteur, maxWidth: '100%', colorScheme: 'dark' }}
    />
  );
}
