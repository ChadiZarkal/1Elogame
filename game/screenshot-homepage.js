#!/usr/bin/env node
/**
 * Take a screenshot of the new homepage using Puppeteer.
 * Captures both mobile (iPhone 14 Pro) and desktop views.
 */
const puppeteer = require('puppeteer');
const path = require('path');

const BASE = 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, 'Screenshots', 'homepage-redesign');

async function screenshot() {
  const fs = require('fs');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Mobile view — iPhone 14 Pro
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await mobile.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 });
  await mobile.waitForSelector('.hub__title', { timeout: 5000 });
  // Wait for animations to settle
  await new Promise(r => setTimeout(r, 1500));
  await mobile.screenshot({
    path: path.join(OUT_DIR, 'homepage-mobile.png'),
    fullPage: false,
  });
  console.log('✅ Mobile screenshot saved');

  // Desktop view
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await desktop.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 });
  await desktop.waitForSelector('.hub__title', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1500));
  await desktop.screenshot({
    path: path.join(OUT_DIR, 'homepage-desktop.png'),
    fullPage: false,
  });
  console.log('✅ Desktop screenshot saved');

  await browser.close();
  console.log(`\n📸 Screenshots saved to ${OUT_DIR}`);
}

screenshot().catch(err => {
  console.error('Screenshot failed:', err.message);
  process.exit(1);
});
