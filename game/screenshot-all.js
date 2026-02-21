#!/usr/bin/env node
/**
 * Comprehensive Screenshot Script — Every page + key actions
 * Captures all pages and interactive states for UX documentation
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUTDIR = path.join(__dirname, '..', 'Screenshots', 'UX-Audit-Final');
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 }; // iPhone 14 Pro

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function shot(page, name, waitMs = 800) {
  await sleep(waitMs);
  const file = path.join(OUTDIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✅ ${name}`);
  return file;
}

async function run() {
  // Clean output
  if (fs.existsSync(OUTDIR)) fs.rmSync(OUTDIR, { recursive: true });
  fs.mkdirSync(OUTDIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  
  // Disable animations for crisp screenshots
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const screenshots = [];

  // ══════════════════════════════════════
  // 1. HOMEPAGE
  // ══════════════════════════════════════
  console.log('\n📱 1. HOMEPAGE');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '01-homepage-hero', 1200));

  // Scroll to see all cards
  await page.evaluate(() => window.scrollTo(0, 300));
  screenshots.push(await shot(page, '02-homepage-cards'));

  // Full page
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  const fullFile = path.join(OUTDIR, '03-homepage-fullpage.png');
  await page.screenshot({ path: fullFile, fullPage: true });
  console.log('  ✅ 03-homepage-fullpage');
  screenshots.push(fullFile);

  // ══════════════════════════════════════
  // 2. RED FLAG LANDING
  // ══════════════════════════════════════
  console.log('\n🚩 2. RED FLAG LANDING');
  await page.goto(`${BASE}/redflag`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '04-redflag-landing', 1200));

  // ══════════════════════════════════════
  // 3. PROFILE FORM (Profile entry)
  // ══════════════════════════════════════
  console.log('\n👤 3. PROFILE FORM');
  await page.goto(`${BASE}/jeu`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '05-profileform-empty', 1200));

  // Select gender  
  try {
    const genderBtns = await page.$$('button');
    for (const btn of genderBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Homme')) {
        await btn.click();
        break;
      }
    }
    screenshots.push(await shot(page, '06-profileform-gender-selected'));

    // Select age
    const ageBtns = await page.$$('button');
    for (const btn of ageBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('19-22')) {
        await btn.click();
        break;
      }
    }
    screenshots.push(await shot(page, '07-profileform-age-selected'));
  } catch (e) {
    console.log('  ⚠️ Skipped profile form interactions:', e.message);
  }

  // ══════════════════════════════════════
  // 4. GAMEPLAY (Duel page)
  // ══════════════════════════════════════
  console.log('\n🎮 4. GAMEPLAY');
  await page.goto(`${BASE}/jeu/jouer`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '08-gameplay-duel', 1500));

  // Try to click a choice (element A - top half)
  try {
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (box && box.height > 100 && box.y < 400) {
        await btn.click();
        screenshots.push(await shot(page, '09-gameplay-voted', 600));
        break;
      }
    }
  } catch (e) {
    console.log('  ⚠️ Skipped vote interaction:', e.message);
  }

  // Wait for result display if available
  await sleep(2000);
  screenshots.push(await shot(page, '10-gameplay-result'));

  // ══════════════════════════════════════
  // 5. FLAG OR NOT
  // ══════════════════════════════════════
  console.log('\n🏳️ 5. FLAG OR NOT');
  await page.goto(`${BASE}/flagornot`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '11-flagornot-initial', 1500));

  // Scroll to see suggestions
  await page.evaluate(() => window.scrollTo(0, 200));
  screenshots.push(await shot(page, '12-flagornot-suggestions'));

  // Try typing in input
  try {
    const input = await page.$('input[type="text"]');
    if (input) {
      await input.click();
      await page.type('input[type="text"]', 'Il like les photos de son ex', { delay: 20 });
      screenshots.push(await shot(page, '13-flagornot-typing'));
    }
  } catch (e) {
    console.log('  ⚠️ Skipped typing interaction:', e.message);
  }

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  screenshots.push(await shot(page, '14-flagornot-bottom'));

  // ══════════════════════════════════════
  // 6. CLASSEMENT / LEADERBOARD
  // ══════════════════════════════════════
  console.log('\n🏆 6. CLASSEMENT');
  await page.goto(`${BASE}/classement`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '15-classement-loading', 500));
  screenshots.push(await shot(page, '16-classement-redflag', 2500));

  // Switch to green flag
  try {
    const greenBtn = await page.$$('button');
    for (const btn of greenBtn) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Green Flag')) {
        await btn.click();
        break;
      }
    }
    screenshots.push(await shot(page, '17-classement-greenflag', 1500));
  } catch (e) {
    console.log('  ⚠️ Skipped green flag toggle:', e.message);
  }

  // Switch to Femmes filter
  try {
    const filterBtns = await page.$$('button');
    for (const btn of filterBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Femmes')) {
        await btn.click();
        break;
      }
    }
    screenshots.push(await shot(page, '18-classement-femmes-filter', 1500));
  } catch (e) {
    console.log('  ⚠️ Skipped filter interaction:', e.message);
  }

  // Scroll to see rankings
  await page.evaluate(() => window.scrollTo(0, 500));
  screenshots.push(await shot(page, '19-classement-rankings'));

  // Full page
  await page.evaluate(() => window.scrollTo(0, 0));
  const classFullFile = path.join(OUTDIR, '20-classement-fullpage.png');
  await page.screenshot({ path: classFullFile, fullPage: true });
  console.log('  ✅ 20-classement-fullpage');
  screenshots.push(classFullFile);

  // ══════════════════════════════════════
  // 7. ADMIN
  // ══════════════════════════════════════
  console.log('\n🔧 7. ADMIN');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '21-admin-login', 1000));

  // ══════════════════════════════════════
  // 8. NOT FOUND (404)
  // ══════════════════════════════════════
  console.log('\n❌ 8. 404 PAGE');
  await page.goto(`${BASE}/page-inexistante`, { waitUntil: 'networkidle2', timeout: 15000 });
  screenshots.push(await shot(page, '22-404-not-found', 1000));

  // ══════════════════════════════════════
  // DONE
  // ══════════════════════════════════════
  await browser.close();

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ ${screenshots.length} screenshots captured`);
  console.log(`📁 ${OUTDIR}`);
  console.log(`═══════════════════════════════════════\n`);

  // Generate markdown report
  const md = [
    '# UX/UI Screenshots — Final Audit',
    '',
    `> Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    `> Device: iPhone 14 Pro (390×844 @2x)`,
    '',
    '## Pages & Actions',
    '',
  ];

  for (const file of screenshots) {
    const name = path.basename(file, '.png');
    md.push(`### ${name.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}`);
    md.push(`![${name}](UX-Audit-Final/${name}.png)`);
    md.push('');
  }

  fs.writeFileSync(path.join(OUTDIR, '..', 'SCREENSHOTS-REPORT.md'), md.join('\n'));
  console.log('📋 SCREENSHOTS-REPORT.md generated');
}

run().catch(console.error);
