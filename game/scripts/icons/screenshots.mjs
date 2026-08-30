/**
 * Capture les vignettes `screenshots` du manifeste.
 *
 *   npm run dev            # dans un autre terminal
 *   node scripts/icons/screenshots.mjs [http://localhost:3000]
 *
 * Sans ces vignettes, Chrome Android n'affiche pas la boîte d'installation
 * enrichie — celle qui montre à quoi ressemble l'application — mais seulement
 * la mini-barre « Ajouter à l'écran d'accueil », beaucoup moins convaincante.
 * Les fichiers produits sont versionnés ; à relancer quand le rendu change.
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = process.argv[2] ?? 'http://localhost:3000';

/**
 * Le manifeste veut du `narrow` (téléphone) et du `wide` (grand écran).
 *
 * On rend aux dimensions CSS réelles de chaque appareil, puis on multiplie par
 * la densité de pixels. Capturer directement en 1080 de large donnerait la mise
 * en page de bureau réduite : ce n'est pas ce que verra la personne qui installe.
 */
const SHOTS = [
  { file: 'screenshot-narrow.png', width: 360, height: 640, scale: 3, path: '/' },
  { file: 'screenshot-wide.png', width: 1280, height: 720, scale: 1.5, path: '/' },
];

/* `CHROME_PATH` : le Chrome que télécharge Puppeteer n'est pas toujours là —
   l'installation le saute quand `PUPPETEER_SKIP_DOWNLOAD` est posé, et un cache
   à moitié écrit passe la vérification de version sans contenir l'exécutable.
   Cette variable laisse pointer un Chrome déjà installé sur la machine. */
const browser = await puppeteer.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});

try {
  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: shot.scale,
    });
    await page.goto(BASE + shot.path, { waitUntil: 'networkidle0' });
    /* Le bandeau de développement de Next se superpose au coin bas-gauche ;
       il n'a rien à faire dans une vignette d'installation. */
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important }' });
    /* Les animations d'entrée durent moins d'une seconde ; on les laisse finir
       pour ne pas capturer un écran à moitié opaque. */
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await page.screenshot({ path: join(ROOT, 'public', shot.file) });
    await page.close();
    console.log(`${shot.file}  ${shot.width * shot.scale}x${shot.height * shot.scale}`);
  }
} finally {
  await browser.close();
}
