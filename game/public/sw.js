/*
 * Service worker de Red or Green.
 *
 * Le site déclarait `display: standalone` sans jamais enregistrer de service
 * worker : une fois « installée », l'application n'était qu'un raccourci vers
 * le réseau. Au premier creux de couverture — métro, ascenseur, 3G en salle —
 * elle ouvrait le dinosaure hors ligne de Chrome, en plein écran et sans barre
 * d'adresse pour recharger. D'où « ça installe, mais ça ne fonctionne pas ».
 *
 * Trois stratégies, choisies par nature de requête :
 *  - navigations : réseau d'abord, repli sur la page hors ligne ;
 *  - fichiers versionnés de Next (`/_next/static`) : cache d'abord, leur URL
 *    contient déjà une empreinte, ils ne changent jamais sous la même adresse ;
 *  - le reste des ressources statiques : cache d'abord avec rafraîchissement
 *    en arrière-plan.
 *
 * Rien de ce qui touche à l'API n'est mis en cache : les verdicts, les votes et
 * les compteurs doivent rester ceux du serveur.
 */

const VERSION = 'v1';
const SHELL = `rog-shell-${VERSION}`;
const ASSETS = `rog-assets-${VERSION}`;
const OFFLINE_URL = '/hors-ligne';

/* Précaché à l'installation : ce qui doit s'afficher même sans réseau. */
const PRECACHE = [OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== SHELL && key !== ASSETS).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Le rechargement demandé par la page quand une nouvelle version est prête. */
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

const isVersionedAsset = (url) => url.pathname.startsWith('/_next/static/');

const isStaticAsset = (url) =>
  /\.(?:css|js|woff2?|png|jpe?g|svg|webp|avif|ico|json)$/.test(url.pathname);

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const fresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);
  return hit || fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  /* Un service worker ne sert que sa propre origine ; laisser passer le reste
     évite d'intercepter les régies publicitaires et la télémétrie. */
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/admin')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      }),
    );
    return;
  }

  if (isVersionedAsset(url)) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, ASSETS));
  }
});
