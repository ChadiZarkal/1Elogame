'use client';

/**
 * @module components/ui/BoutonLangue
 * Le passage d'une langue à l'autre, et la proposition faite aux visiteurs
 * dont le navigateur n'est pas en français.
 *
 * DEMANDÉ COMME « ÉVIDENT » (2026-11-14)
 *   Quelqu'un qui arrive sur redorgreen.fr doit voir tout de suite comment
 *   avoir le site en anglais. D'où trois points d'entrée :
 *   - sur l'accueil, qui n'a pas de barre de site, un bouton en haut de page ;
 *   - dans la barre du site, partout ailleurs, à côté du café ;
 *   - pour un navigateur réglé dans une autre langue que le français, une
 *     bande en haut des pages françaises, qui propose l'anglais une fois.
 *
 * Aucune redirection automatique : un robot d'indexation ou un francophone au
 * navigateur en anglais tomberaient sur une page qu'ils n'ont pas demandée.
 * La bande se ferme, et le choix est retenu sur l'appareil.
 */

import { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Link from '@/components/ui/LienIntention';
import { normaliserChemin } from './SiteHeader';
import { cheminAutreLangue, langueDuChemin } from '@/lib/i18n/langue';

/** La langue choisie à la main sur cet appareil ; elle fait taire la bande. */
const CLE_CHOIX = 'rog_langue';

function retenir(langue: 'fr' | 'en') {
  try {
    localStorage.setItem(CLE_CHOIX, langue);
  } catch {
    /* Navigation privée : le choix n'est simplement pas retenu. */
  }
}

/** Le bouton : « 🇬🇧 EN » sur une page française, « 🇫🇷 FR » sur une anglaise. */
export function BoutonLangue({ className = '', long = false }: { className?: string; long?: boolean }) {
  const chemin = normaliserChemin(usePathname()) || '/';
  const versAnglais = langueDuChemin(chemin) === 'fr';
  const libelle = versAnglais ? (long ? 'English' : 'EN') : long ? 'Français' : 'FR';

  return (
    <Link
      href={cheminAutreLangue(chemin)}
      hrefLang={versAnglais ? 'en' : 'fr'}
      lang={versAnglais ? 'en' : 'fr'}
      onClick={() => retenir(versAnglais ? 'en' : 'fr')}
      className={className}
      aria-label={versAnglais ? 'English version' : 'Version française'}
    >
      <span aria-hidden>{versAnglais ? '🇬🇧' : '🇫🇷'}</span>
      <span>{libelle}</span>
    </Link>
  );
}

/** Rien à écouter : la langue du navigateur et le choix retenu ne changent pas sous nos yeux. */
const abonnementVide = () => () => {};

/** Faut-il proposer l'anglais à ce navigateur ? Jamais au serveur. */
function proposerAnglais(): boolean {
  let choix: string | null = null;
  try {
    choix = localStorage.getItem(CLE_CHOIX);
  } catch {
    /* Navigation privée : on propose, simplement sans retenir. */
  }
  const langues = navigator.languages?.length ? navigator.languages : [navigator.language];
  const francophone = langues.some((l) => l?.toLowerCase().startsWith('fr'));
  return !choix && !francophone;
}

/**
 * La bande proposée aux navigateurs qui ne sont pas en français, sur les pages
 * françaises seulement. Rien n'est rendu au serveur : la langue du navigateur
 * ne se lit qu'au navigateur, et la page ne change pas de taille au premier
 * affichage pour ceux — la majorité — à qui elle ne s'adresse pas.
 */
export function SuggestionLangue() {
  const chemin = normaliserChemin(usePathname()) || '/';
  const proposer = useSyncExternalStore(abonnementVide, proposerAnglais, () => false);
  const [fermee, setFermee] = useState(false);

  if (!proposer || fermee || langueDuChemin(chemin) === 'en' || chemin.startsWith('/admin')) return null;

  const fermer = () => {
    retenir('fr');
    setFermee(true);
  };

  return (
    <div className="bande-langue" lang="en" role="region" aria-label="Language">
      <span>🇬🇧 English speaker?</span>
      <Link href={cheminAutreLangue(chemin)} hrefLang="en" onClick={() => retenir('en')} className="bande-langue__lien">
        Switch to English
      </Link>
      <button type="button" onClick={fermer} className="bande-langue__fermer" aria-label="Stay in French">
        ✕
      </button>
    </div>
  );
}
