'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isAdFreePath, NATIVE_BANNER } from '@/config/ads';
import { useAdConsent } from '@/lib/adConsent';
import { AdConsent } from './AdConsent';
import { useAdsterraScript } from './useAdsterraScript';

/**
 * @module components/ads/NativeAd
 * Encart natif Adsterra, et la demande d'accord qui le précède.
 *
 * C'est le seul des trois formats fournis par la régie qui s'insère dans le
 * flux au lieu de se poser par-dessus : il occupe la place d'un bloc de
 * contenu, ne recouvre aucun bouton et n'ouvre aucune fenêtre. C'est la raison
 * pour laquelle c'est celui-là qui est allumé.
 *
 * Le composant porte les trois états du même emplacement : la question quand
 * elle n'a pas été posée, l'encart après un accord, rien après un refus. Les
 * réunir ici garantit qu'on ne peut pas placer l'un sans l'autre.
 *
 * Deux choix de forme méritent d'être justifiés.
 *
 * La mention « Publicité » est obligatoire, pas décorative. Un encart *natif*
 * emprunte volontairement la typographie et la mise en forme du contenu qui
 * l'entoure : sans étiquette, il se lit comme un article du site. Les règles de
 * l'ARPP comme le code de la consommation imposent qu'une communication
 * commerciale soit identifiable comme telle.
 *
 * Aucune hauteur n'est réservée. Un `min-height` garderait un trou visible chez
 * tous ceux qui bloquent la publicité, ou quand la régie n'a rien à servir —
 * c'est-à-dire souvent. L'emplacement est placé sous la ligne de flottaison,
 * là où un décalage tardif ne déplace rien de ce qui est à l'écran.
 */
export function NativeAd({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? '';
  const consent = useAdConsent();

  /* Appelé sans condition, comme tout crochet : c'est lui qui refuse
     l'insertion tant que l'accord manque, pas la branche de rendu ci-dessous. */
  useAdsterraScript(NATIVE_BANNER.src, NATIVE_BANNER.enabled, hostRef);

  if (!NATIVE_BANNER.enabled) return null;
  if (isAdFreePath(pathname)) return null;

  /* `pending` est l'état du rendu serveur et du premier rendu client : ne rien
     afficher évite l'écart d'hydratation et l'apparition d'un bloc chez
     quelqu'un qui a déjà répondu. */
  if (consent === 'pending' || consent === 'denied') return null;
  if (consent === 'unknown') return <AdConsent className={className} />;

  return (
    <aside
      ref={hostRef}
      className={`native-ad ${className}`.trim()}
      aria-label="Publicité"
    >
      <p className="native-ad__label" aria-hidden>
        Publicité
      </p>
      {/* Le script de la régie retrouve ce conteneur par son identifiant : il
          est imposé par l'emplacement, pas choisi ici. */}
      <div id={NATIVE_BANNER.containerId} />
    </aside>
  );
}
