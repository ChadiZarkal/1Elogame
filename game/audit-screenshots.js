/**
 * UX/UI Audit Screenshot Script
 * Takes screenshots of all pages for visual review
 * Run: node audit-screenshots.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const today = new Date().toISOString().split('T')[0]; // 2026-02-21
const OUTPUT_DIR = path.join(__dirname, '..', 'Screenshots', `audit-${today}`);

const PAGES = [
  { name: '01-homepage', path: '/', wait: 2000 },
  { name: '02-profile-form', path: '/jeu', wait: 1500 },
  { name: '03-flagornot', path: '/flagornot', wait: 1500 },
  { name: '04-classement', path: '/classement', wait: 2000 },
  { name: '05-admin', path: '/admin', wait: 1500 },
];

async function takeScreenshots() {
  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
  });

  const results = [];

  for (const page of PAGES) {
    try {
      const tab = await browser.newPage();

      // Mobile viewport (iPhone 14 Pro)
      await tab.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });

      const url = `${BASE_URL}${page.path}`;
      console.log(`📸 ${page.name}: ${url}`);

      await tab.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, page.wait));

      // Mobile screenshot
      const mobilePath = path.join(OUTPUT_DIR, `${page.name}-mobile.png`);
      await tab.screenshot({ path: mobilePath, fullPage: true });

      // Desktop screenshot
      await tab.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
      await tab.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, page.wait));

      const desktopPath = path.join(OUTPUT_DIR, `${page.name}-desktop.png`);
      await tab.screenshot({ path: desktopPath, fullPage: true });

      results.push({ page: page.name, status: 'OK', mobile: mobilePath, desktop: desktopPath });

      await tab.close();
    } catch (err) {
      console.error(`  ❌ Error on ${page.name}:`, err.message);
      results.push({ page: page.name, status: 'ERROR', error: err.message });
    }
  }

  await browser.close();

  // Write summary
  const summary = results.map(r => `${r.status === 'OK' ? '✅' : '❌'} ${r.page}: ${r.status}`).join('\n');
  const summaryPath = path.join(OUTPUT_DIR, 'SUMMARY.txt');
  fs.writeFileSync(summaryPath, `UX/UI Audit Screenshots — ${today}\n\n${summary}\n`);

  console.log('\n' + summary);
  console.log(`\n📁 Screenshots saved to: ${OUTPUT_DIR}`);

  return results;
}

takeScreenshots().catch(console.error);
