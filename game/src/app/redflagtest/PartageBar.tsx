'use client';

/**
 * @module redflagtest/PartageBar
 * Le partage d'un résultat.
 *
 * POURQUOI DEUX BOUTONS ET PAS UN
 *   « Défie un pote » et « Copier le lien » mènent au même endroit, mais ne
 *   servent pas la même envie. Le premier est le mécanisme : le destinataire
 *   arrive sur « devine son score » et doit jouer avant de voir. Le second est
 *   la sortie de secours de ceux qui veulent juste coller l'adresse quelque
 *   part. Fondre les deux en un seul bouton, c'est perdre l'un des deux.
 *
 * `navigator.share` ouvre la feuille de partage native du téléphone — celle qui
 * propose les conversations récentes. Elle n'existe pas partout, et elle lève
 * quand l'utilisateur annule : les deux cas retombent sur la copie, qui marche
 * toujours.
 */

import { useState } from 'react';

/** Le temps que dure la confirmation « copié ». */
const CONFIRMATION_MS = 2200;

export function PartageBar({
  code,
  score,
  archetype,
}: {
  code: string;
  score: number;
  /** Le titre de l'archétype, s'il y en a un — c'est lui qui donne envie de cliquer. */
  archetype: string | null;
}) {
  const [copie, setCopie] = useState(false);

  // Construite au clic et non au rendu : le serveur ne connaît pas le domaine
  // depuis lequel la page a été servie, et une URL figée à la compilation
  // enverrait les liens de la préversion vers la production.
  const lien = () => `${window.location.origin}/redflagtest/r/${code}`;

  const texte = archetype
    ? `Je suis ${score} % red flag — ${archetype}. Devine ton score.`
    : `Je suis ${score} % red flag. Devine ton score.`;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien());
      setCopie(true);
      setTimeout(() => setCopie(false), CONFIRMATION_MS);
    } catch {
      // Presse-papiers refusé — contexte non sécurisé, permission bloquée. Le
      // lien reste affiché sous les boutons, à sélectionner à la main.
    }
  };

  const defier = async () => {
    if (typeof navigator.share !== 'function') {
      void copier();
      return;
    }
    try {
      await navigator.share({ title: 'Red Flag Test', text: texte, url: lien() });
    } catch {
      // Feuille de partage annulée : ce n'est pas un échec, et surtout pas une
      // raison d'afficher une erreur.
    }
  };

  return (
    <div className="partage">
      <button type="button" className="share-btn" onClick={defier}>
        {/* eslint-disable-next-line @next/next/no-img-element -- markup de
            référence ; `flac.css` dimensionne l'icône via .share-icon. */}
        <img className="share-icon" src="/rft/img/symbol-share.svg" alt="" />
        <p>Défie un pote</p>
      </button>

      <button type="button" className="partage-copier" onClick={copier}>
        {copie ? '✓ Lien copié' : 'Copier le lien'}
      </button>

      <p className="partage-note">
        Celui qui l’ouvre devra deviner ton score avant de le voir.
        {/* La carte du haut est dessinée pour être capturée : bornée, signée,
            et posée assez haut pour tenir dans une capture prise sans viser.
            Le dire évite que le lien soit le seul chemin de sortie. */}
        <br />
        Ou fais une capture de la carte, elle porte l’adresse.
      </p>
    </div>
  );
}
