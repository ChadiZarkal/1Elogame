const puppeteer = require('puppeteer');
const path = require('path');

const SHOTS_DIR = path.join(__dirname, 'Screenshots');

async function screenshot(page, name, extra = '') {
  await new Promise(r => setTimeout(r, 1200));
  const file = path.join(SHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[SHOT] ${name}.png - ${extra}`);
  return file;
}

(async () => {
  const { mkdirSync } = require('fs');
  mkdirSync(SHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2 };
  const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 };

  const page = await browser.newPage();

  // ── HOMEPAGE mobile ──
  await page.setViewport(MOBILE);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '01-home-mobile', 'homepage on 390px');

  // ── HOMEPAGE desktop ──
  await page.setViewport(DESKTOP);
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '02-home-desktop', 'homepage on 1280px');

  // ── /jeu page ──
  await page.setViewport(MOBILE);
  await page.goto('http://localhost:3000/jeu', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '03-jeu-landing', '/jeu landing');

  // ── /jeu - click start to see duel loading ──
  try {
    await page.goto('http://localhost:3000/jeu', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    // Select gender and age to unlock start
    const btns = await page.$$('button');
    // click homme
    for (const btn of btns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt && txt.includes('Homme')) { await btn.click(); break; }
    }
    await new Promise(r => setTimeout(r, 300));
    // click 19-22
    for (const btn of btns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt && txt.includes('19-22')) { await btn.click(); break; }
    }
    await new Promise(r => setTimeout(r, 300));
    // click start
    const startBtns = await page.$$('button');
    for (const btn of startBtns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt && (txt.includes('PARTI') || txt.includes('JOUER') || txt.includes('Commencer'))) {
        await btn.click(); break;
      }
    }
    await new Promise(r => setTimeout(r, 3000));
    await screenshot(page, '04-jeu-duel-load', 'after clicking start - shows duel or loading?');
  } catch (e) {
    console.log('[SKIP] jeu start click failed:', e.message);
  }

  // ── /jeu/jouer direct ──
  await page.goto('http://localhost:3000/jeu/jouer', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '05-jeu-jouer', '/jeu/jouer direct');

  // ── /flagornot ──
  await page.goto('http://localhost:3000/flagornot', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '06-flagornot', '/flagornot');

  // ── /classement ──
  await page.goto('http://localhost:3000/classement', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await screenshot(page, '07-classement', '/classement');

  await browser.close();
  console.log('\n[DONE] All screenshots saved to Screenshots/');
})().catch(e => { console.error(e.message); process.exit(1); });
