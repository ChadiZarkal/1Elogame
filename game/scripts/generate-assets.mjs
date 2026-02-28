import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

async function generate() {
  const iconSvg = (size) => `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
    <rect width='${size}' height='${size}' rx='${Math.round(size * 0.15)}' fill='#0D0D0D'/>
    <text x='50%' y='55%' font-size='${Math.round(size * 0.55)}' text-anchor='middle' dominant-baseline='middle'>🚩</text>
  </svg>`;

  await sharp(Buffer.from(iconSvg(192))).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('icon-192.png');

  await sharp(Buffer.from(iconSvg(512))).png().toFile(path.join(publicDir, 'icon-512.png'));
  console.log('icon-512.png');

  await sharp(Buffer.from(iconSvg(180))).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('apple-touch-icon.png');

  const ogSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'>
    <defs>
      <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='#0D0D0D'/>
        <stop offset='100%' stop-color='#1A1A1A'/>
      </linearGradient>
    </defs>
    <rect width='1200' height='630' fill='url(#bg)'/>
    <text x='600' y='250' font-size='80' font-weight='800' fill='white' text-anchor='middle' font-family='system-ui,-apple-system,sans-serif'>🚩 Red or Green</text>
    <text x='600' y='340' font-size='36' fill='#999' text-anchor='middle' font-family='system-ui,-apple-system,sans-serif'>Le jeu qui divise</text>
    <text x='600' y='440' font-size='24' fill='#666' text-anchor='middle' font-family='system-ui,-apple-system,sans-serif'>Joue gratuitement &#8212; Sans inscription, sans t&#233;l&#233;chargement</text>
    <text x='600' y='560' font-size='18' fill='#555' text-anchor='middle' font-family='system-ui,-apple-system,sans-serif'>redorgreen.fr</text>
  </svg>`;
  await sharp(Buffer.from(ogSvg)).png().toFile(path.join(publicDir, 'og-image.png'));
  console.log('og-image.png');

  console.log('All assets generated!');
}

generate().catch(e => { console.error(e); process.exit(1); });
