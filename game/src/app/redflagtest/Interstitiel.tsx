'use client';

/**
 * @module redflagtest/Interstitiel
 * La pause publicitaire, entre la dernière réponse et le résultat.
 *
 * Le résultat se calcule pendant ce temps : la requête part à la dernière
 * réponse, et l'écran ne fait qu'attendre qu'elle revienne ET que le compte à
 * rebours soit écoulé. Le joueur ne perd rien à la pause — elle recouvre un
 * calcul qui aurait de toute façon pris une seconde.
 *
 * Deux formats Adsterra, réglés dans `config/ads.ts` :
 *  - l'encart natif, au milieu de l'écran, étiqueté « Publicité » ;
 *  - le pop-under, armé ici et déclenché par le clic sur « Voir mon résultat ».
 *    Il n'est chargé que si AdSense est absent de la page (voir RFT_POPUNDER).
 *
 * Un bloqueur de publicité laisse l'encart vide : l'écran reste le même, avec
 * son compte à rebours, et le résultat arrive à l'heure.
 */

import { useEffect, useState } from 'react';
import { RFT_INTERSTITIEL, RFT_INTERSTITIEL_DUREE_S, RFT_POPUNDER } from '@/config/ads';
import { useAdsterraScript } from '@/components/ads/useAdsterraScript';
import { CadreRegie } from '@/components/ads/CadreRegie';

/** AdSense est-il chargé sur la page ? Si oui, pas de pop-under. */
function adsensePresent(): boolean {
  return Boolean(document.querySelector('script[src*="adsbygoogle"], ins.adsbygoogle'));
}

export function Interstitiel({
  pret,
  onContinuer,
}: {
  /** Le résultat est revenu du serveur. */
  pret: boolean;
  onContinuer: () => void;
}) {
  const [reste, setReste] = useState(RFT_INTERSTITIEL_DUREE_S);
  // Décidé une fois, au montage : la présence d'AdSense ne change pas pendant
  // les cinq secondes de la pause.
  const [popunderPermis] = useState(() => typeof document !== 'undefined' && !adsensePresent());

  // Le pop-under reste dans la page : c'est elle qu'il doit surveiller.
  // L'encart, lui, a son propre document (voir CadreRegie).
  useAdsterraScript(RFT_POPUNDER.src, RFT_POPUNDER.enabled && popunderPermis);

  // Recalculé depuis l'heure de départ plutôt que décompté seconde par
  // seconde : un onglet en arrière-plan ralentit les minuteurs, et un compte à
  // rebours décompté prendrait alors bien plus de cinq secondes.
  useEffect(() => {
    const depart = Date.now();
    const minuteur = setInterval(() => {
      const r = Math.max(0, RFT_INTERSTITIEL_DUREE_S - Math.floor((Date.now() - depart) / 1000));
      setReste(r);
      if (r === 0) clearInterval(minuteur);
    }, 250);
    return () => clearInterval(minuteur);
  }, []);

  const accessible = reste <= 0 && pret;

  return (
    <section className="intro-wrapper interstitiel">
      <h2>Ton résultat arrive</h2>
      <p className="interstitiel-texte">On compte les dégâts…</p>

      <div className="intro-form interstitiel-actions">
        <button
          type="button"
          className="button-start"
          onClick={onContinuer}
          disabled={!accessible}
          aria-live="polite"
        >
          {reste > 0 ? `Ton résultat dans ${reste}…` : pret ? 'Voir mon résultat' : 'Encore un instant…'}
        </button>
      </div>

      <aside className="interstitiel-pub" aria-label="Publicité">
        <p className="interstitiel-etiquette" aria-hidden="true">Publicité</p>
        {RFT_INTERSTITIEL.enabled && <CadreRegie unit={RFT_INTERSTITIEL} />}
      </aside>
    </section>
  );
}
