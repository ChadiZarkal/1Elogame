'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Invitation à installer l'application, et extinction de la bannière du
 * navigateur.
 *
 * Depuis que le site est réellement installable — manifeste complet et service
 * worker —, Chrome affiche de lui-même sa barre « Ajouter à l'écran
 * d'accueil ». Elle revient à chaque visite et rien dans la page ne permet de
 * s'en débarrasser : c'est le navigateur qui décide. `preventDefault()` sur
 * `beforeinstallprompt` est le seul moyen documenté de la faire taire, et il
 * est posé dans `ServiceWorker`, monté par le gabarit racine.
 *
 * En échange, c'est à nous d'inviter — d'où cette feuille, qui se montre une
 * fois puis se tait définitivement si on la referme.
 *
 * Deux chemins, parce que les plateformes n'offrent pas la même chose :
 *
 * - Chrome, Edge, Android : le navigateur nous confie un événement, un bouton
 *   déclenche la vraie boîte d'installation du système.
 * - Safari iOS : aucun événement, aucune API. L'ajout à l'écran d'accueil
 *   n'existe que dans le menu de partage, et il faut donc l'expliquer. Sans ce
 *   second chemin, la moitié des visiteurs d'un jeu mobile ne verrait jamais
 *   rien.
 */

/** Le renvoi est mémorisé sans date : « non » veut dire non. */
const DISMISSED_KEY = 'rog_install_dismissed';

/** Laisse la page se peindre avant d'inviter. */
const DELAY_MS = 2200;

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
    /* navigation privée, stockage bloqué : on ne sait rien, on invite */
    return false;
  }
}

/** iOS, tous navigateurs : aucun n'y expose d'API d'installation. */
function isIos(): boolean {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ se présente comme un Mac, mais avec un écran tactile.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

type Mode = 'hidden' | 'prompt' | 'ios';

export function InstallApp() {
  const [mode, setMode] = useState<Mode>('hidden');
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInstalled() || wasRefused()) return;

    /* Chrome et Edge : on garde l'événement pour déclencher la vraie boîte.
       Les conditions sont revérifiées ici et pas seulement au montage : le
       navigateur n'émet qu'un événement par chargement, mais s'il en émettait
       un second après un refus, la feuille reviendrait — exactement ce qu'on
       cherche à empêcher. */
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (isInstalled() || wasRefused()) return;
      setPromptEvent(event as InstallPromptEvent);
      setMode('prompt');
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setMode('hidden');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    /* iOS n'émettra jamais l'événement : après le délai, si rien n'est venu,
       on explique le menu de partage. Sur les autres navigateurs sans API
       (Firefox), on ne montre rien — il n'y a rien à expliquer. */
    const timer = setTimeout(() => {
      setMode((current) => (current === 'hidden' && isIos() ? 'ios' : current));
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    setMode('hidden');
    await promptEvent.prompt();
    /* Quel que soit le choix, l'événement est consommé : le navigateur n'en
       émettra pas d'autre pour cette page. */
    setPromptEvent(null);
  }, [promptEvent]);

  const refuse = useCallback(() => {
    setMode('hidden');
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* sans stockage, le refus ne vaut que pour cette page — c'est déjà mieux
         que la barre du navigateur, qui revenait à chaque visite */
    }
  }, []);

  if (mode === 'hidden') return null;

  return (
    <div
      role="dialog"
      aria-label="Installer Red or Green"
      /* `fixed` : cette feuille appartient à la fenêtre, pas au flux du pied
         de page qui la rend — sans quoi elle naîtrait sous la ligne de
         flottaison, là où personne ne la verrait. */
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-110 animate-fade-slide-up px-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      {/* Une seule rangée, et le bouton dedans plutôt qu'en dessous : empilé,
          la feuille montait à 152 px et recouvrait de 37 px le bouton qui
          lance le jeu. À 84 px elle ne mord plus que sur la rangée de
          raccourcis, qu'on retrouve d'un geste. */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#141416]/97 p-3 shadow-[0_-12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- icône locale de 192 px servie telle quelle : la passer par l'optimiseur pour une vignette de 36 px n'apporte rien. */}
        <img
          src="/icon-192.png"
          alt=""
          width={36}
          height={36}
          className="hidden shrink-0 rounded-lg min-[380px]:block"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black leading-tight text-white">
            Installer l&apos;app
          </p>
          <p className="mt-0.5 text-[11px] leading-tight text-[#A6A6A6]">
            {mode === 'ios' ? 'Partager, puis « Sur l’écran d’accueil ».' : 'Plein écran, et marche hors ligne.'}
          </p>
        </div>

        {mode === 'prompt' && (
          <button
            type="button"
            onClick={install}
            className="flex min-h-11 shrink-0 items-center rounded-xl bg-white px-3.5 text-[11px] font-black uppercase tracking-[0.12em] text-black transition-transform active:scale-[0.96]"
          >
            Installer
          </button>
        )}

        <button
          type="button"
          onClick={refuse}
          aria-label="Ne plus proposer l'installation"
          className="flex h-11 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B6B70] transition-colors hover:text-white"
        >
          <span aria-hidden className="text-xl leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
