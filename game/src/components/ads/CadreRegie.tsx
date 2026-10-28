'use client';

/**
 * @module components/ads/CadreRegie
 * Un encart natif Adsterra dans son propre document (iframe `srcdoc`).
 *
 * Le script de la régie ne s'initialise qu'une fois par document : à sa
 * deuxième exécution, il s'arrête (`invoke_init.skip.duplicate`) et le
 * conteneur reste vide. Or le site ne recharge jamais la page — on navigue
 * côté client, et chaque verdict, chaque fin de partie remonte un encart.
 * Mesuré en production le 2026-10-28 : venu de l'accueil, le verdict de
 * l'Oracle restait vide ; chargé directement, le premier verdict se
 * remplissait et le deuxième non. Le même défaut touchait chaque profil de
 * « C'est un 10 mais… » après le premier, et la pause du Red Flag Test.
 *
 * Un cadre par encart donne au script un document neuf à chaque fois : trois
 * cadres successifs dans la même page se sont remplis tous les trois.
 *
 * Trois détails du cadre, chacun vérifié :
 * - `color-scheme: dark`, comme la page. Sans lui, Chrome peint un fond blanc
 *   opaque sous un document clair inclus dans une page sombre.
 * - La couleur et la police du texte sont lues sur l'hôte, et les `@font-face`
 *   de la page recopiées : la régie hérite de ce qu'elle trouve, et
 *   l'annonce garde l'allure qu'elle avait dans la page.
 * - La hauteur suit le contenu. Rien n'est réservé tant que la régie n'a rien
 *   servi : un bloqueur ou un inventaire vide ne laissent pas de trou.
 */

import { useEffect, useRef, useState } from 'react';
import type { NativeAdUnit } from '@/config/ads';

/**
 * Les `@font-face` de la page, adresses rendues absolues pour le cadre. Elles
 * sont relatives à leur feuille (`../media/…`) : résolues depuis le cadre,
 * dont l'adresse est celle de la page, elles pointaient à côté.
 */
function policesDeLaPage(): string {
  let css = '';
  for (const feuille of Array.from(document.styleSheets)) {
    let regles: CSSRuleList;
    try {
      regles = feuille.cssRules;
    } catch {
      continue; // Feuille d'une autre origine : illisible, et sans nos polices.
    }
    const base = feuille.href ?? location.href;
    for (const regle of Array.from(regles)) {
      if (regle instanceof CSSFontFaceRule) {
        css +=
          regle.cssText.replace(
            /url\((["']?)([^"')]+)\1\)/g,
            (_, guillemet: string, adresse: string) =>
              `url(${guillemet}${new URL(adresse, base).href}${guillemet})`,
          ) + '\n';
      }
    }
  }
  return css;
}

/** Le document servi dans le cadre : le conteneur, puis le script de la régie. */
export function documentEncart(
  unit: NativeAdUnit,
  style: { couleur: string; police: string; polices?: string },
): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<style>${style.polices ?? ''}
html,body{margin:0;background:transparent}
body{color:${style.couleur};font-family:${style.police};-webkit-font-smoothing:antialiased}
img,iframe,table{max-width:100%}
</style></head><body>
<div id="${unit.containerId}"></div>
<script async data-cfasync="false" src="${unit.src}"></script>
</body></html>`;
}

export function CadreRegie({ unit, className = '' }: { unit: NativeAdUnit; className?: string }) {
  const cadre = useRef<HTMLIFrameElement>(null);
  const [hauteur, setHauteur] = useState(0);

  useEffect(() => {
    const iframe = cadre.current;
    if (!iframe) return;

    let observateur: ResizeObserver | undefined;
    const suivreLaHauteur = () => {
      const corps = iframe.contentDocument?.body;
      const fenetre = iframe.contentWindow as (Window & typeof globalThis) | null;
      // Sans `ResizeObserver` (navigateur ancien), le cadre garde sa hauteur
      // nulle : l'encart ne s'affiche pas, la page ne casse pas.
      if (!corps || !fenetre?.ResizeObserver) return;
      observateur?.disconnect();
      observateur = new fenetre.ResizeObserver(() => {
        setHauteur(Math.ceil(corps.getBoundingClientRect().height));
      });
      observateur.observe(corps);
    };

    const hote = getComputedStyle(iframe);
    iframe.addEventListener('load', suivreLaHauteur);
    iframe.srcdoc = documentEncart(unit, {
      couleur: hote.color,
      police: hote.fontFamily,
      polices: policesDeLaPage(),
    });

    return () => {
      iframe.removeEventListener('load', suivreLaHauteur);
      observateur?.disconnect();
    };
  }, [unit]);

  return (
    <iframe
      ref={cadre}
      title="Publicité"
      className={`block w-full border-0 ${className}`.trim()}
      style={{ height: hauteur, colorScheme: 'dark' }}
    />
  );
}
