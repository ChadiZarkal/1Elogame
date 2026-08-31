'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Bouton d'installation de l'application, et surtout : extinction de la
 * bannière du navigateur.
 *
 * Depuis que le site est réellement installable — manifeste complet et service
 * worker —, Chrome affiche de lui-même sa barre « Ajouter à l'écran
 * d'accueil ». Elle revient à chaque visite, et rien dans la page ne permet de
 * s'en débarrasser : c'est le navigateur qui décide.
 *
 * `preventDefault()` sur `beforeinstallprompt` est le seul moyen documenté de
 * la faire taire. En échange, c'est à nous de proposer l'installation — d'où ce
 * bouton, discret, au pied de page. Il n'apparaît que si le navigateur a
 * réellement jugé l'application installable, et se referme définitivement si
 * on le renvoie.
 *
 * L'extinction elle-même est posée dans `ServiceWorker`, monté par le gabarit
 * racine : ce composant-ci vit dans le pied de page, absent des écrans de jeu
 * immersifs, où Chrome reprendrait donc la main.
 *
 * Rien de tout cela ne concerne iOS : Safari n'émet pas cet événement et
 * n'affiche aucune bannière — l'ajout à l'écran d'accueil y passe par le menu
 * de partage.
 */

/** Le renvoi est mémorisé sans date : « non » veut dire non. */
const DISMISSED_KEY = 'rog_install_dismissed';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Déjà installée : ni bannière ni bouton n'ont de sens. */
function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS n'implémente pas `display-mode` et expose ce drapeau.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasRefused(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    /* navigation privée, stockage bloqué : on ne sait rien, on propose */
    return false;
  }
}

export function InstallApp() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    /* Les conditions sont lues à l'arrivée de l'événement, pas au montage :
       cela évite d'écrire de l'état pendant l'effet, et ces conditions ne
       servent de toute façon qu'à cet instant-là. */
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isInstalled() || wasRefused()) return;
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    /* Quel que soit le choix, l'événement est consommé : le navigateur n'en
       émettra pas d'autre pour cette page. */
    setPromptEvent(null);
  }, [promptEvent]);

  const refuse = useCallback(() => {
    setPromptEvent(null);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* sans stockage, le refus ne vaut que pour cette page — c'est déjà mieux
         que la barre du navigateur, qui revenait à chaque visite */
    }
  }, []);

  if (!promptEvent) return null;

  return (
    <div className="mb-5 flex items-center gap-2">
      <button
        type="button"
        onClick={install}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3.5 text-[12px] font-black uppercase tracking-[0.14em] text-[#D4D4D8] transition-colors hover:border-white/25 hover:text-white"
      >
        <span aria-hidden>📲</span>
        Installer l&apos;application
      </button>
      <button
        type="button"
        onClick={refuse}
        aria-label="Ne plus proposer l'installation"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[#6B6B70] transition-colors hover:text-white"
      >
        <span aria-hidden className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}
