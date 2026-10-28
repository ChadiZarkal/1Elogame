'use client';

import { usePathname } from 'next/navigation';
import { isAdFreePath, NATIVE_BANNER, type NativeAdUnit } from '@/config/ads';
import { CadreRegie } from './CadreRegie';

/**
 * @module components/ads/NativeAd
 * Encart natif Adsterra.
 *
 * C'est le seul des trois formats fournis par la régie qui s'insère dans le
 * flux au lieu de se poser par-dessus : il occupe la place d'un bloc de
 * contenu, ne recouvre aucun bouton et n'ouvre aucune fenêtre. C'est la raison
 * pour laquelle c'est celui-là qui est allumé.
 *
 * Il se charge dès l'arrivée sur la page, sans rien demander. Ce choix est
 * assumé côté produit ; ce qu'il implique est écrit dans les pages légales, qui
 * décrivent le dépôt de traceurs et les moyens de s'y opposer.
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
export function NativeAd({
  className = '',
  unit = NATIVE_BANNER,
}: {
  className?: string;
  /** L'emplacement de la régie ; le bandeau des pages de contenu par défaut. */
  unit?: NativeAdUnit;
}) {
  const pathname = usePathname() ?? '';

  if (!unit.enabled) return null;
  if (isAdFreePath(pathname)) return null;

  return (
    <aside className={`native-ad ${className}`.trim()} aria-label="Publicité">
      <p className="native-ad__label" aria-hidden>
        Publicité
      </p>
      {/* Dans son propre document : la régie ne remplit qu'un conteneur par
          page, et le site ne recharge jamais la sienne (voir CadreRegie). */}
      <CadreRegie unit={unit} />
    </aside>
  );
}
