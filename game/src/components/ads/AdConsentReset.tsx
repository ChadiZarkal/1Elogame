'use client';

import { resetAdConsent, useAdConsent } from '@/lib/adConsent';

/**
 * @module components/ads/AdConsentReset
 * Reprise du choix publicitaire, depuis la politique de confidentialité.
 *
 * Un accord qu'on ne peut pas retirer n'est pas un accord : le règlement exige
 * que le retrait soit aussi simple que l'octroi. Ce bouton repose la question
 * en ramenant le choix à l'état « pas encore répondu » — le bandeau réapparaît
 * alors, avec ses deux mêmes boutons.
 *
 * Le bouton est rendu dès le serveur, désactivé, plutôt que masqué le temps de
 * lire le stockage : apparaître après coup déplacerait le texte autour de lui.
 */
const LABELS: Record<string, string> = {
  pending: 'Chargement de votre choix…',
  unknown: 'Aucun choix enregistré pour le moment.',
  granted: 'Votre choix actuel : publicité acceptée.',
  denied: 'Votre choix actuel : publicité refusée.',
};

export function AdConsentReset() {
  const consent = useAdConsent();

  return (
    <p>
      {LABELS[consent]}{' '}
      <button
        type="button"
        className="ad-consent-reset"
        onClick={resetAdConsent}
        disabled={consent === 'pending' || consent === 'unknown'}
      >
        Modifier mon choix
      </button>
    </p>
  );
}
