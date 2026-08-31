'use client';

import { useEffect } from 'react';

/**
 * Enregistre `public/sw.js`.
 *
 * Monté dans le gabarit racine, sans rien rendre. L'enregistrement attend le
 * chargement complet : le service worker n'a aucun rôle à jouer au premier
 * affichage, et le démarrer plus tôt le met en concurrence avec les requêtes
 * qui, elles, peignent l'écran.
 *
 * En développement l'enregistrement est sauté : le cache masquerait les
 * modifications à chaud. Tout service worker déjà posé sur `localhost` par une
 * session précédente est au contraire retiré, sans quoi il survit au
 * changement de branche et sert une version périmée du jeu.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Navigation privée, réglages bloquants : l'application fonctionne
           sans, elle perd seulement son mode hors ligne. */
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
