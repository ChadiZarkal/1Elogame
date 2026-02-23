#!/usr/bin/env node
/**
 * OODA Screenshot Loop — takes a mobile screenshot, analyzes visible elements,
 * and reports what's visible vs what's expected.
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, 'Screenshots', 'ooda-loops');
const ITERATION = process.argv[2] || '1';

async function ooda() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // iPhone 14 Pro viewport
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 15000 });
  // Wait for any animations
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot
  const filename = `ooda-${ITERATION.padStart(2, '0')}.png`;
  await page.screenshot({
    path: path.join(OUT_DIR, filename),
    fullPage: false,
  });

  // DOM Analysis — check what's actually visible
  const analysis = await page.evaluate(() => {
    const results = {
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      viewportHeight: window.innerHeight,
      visibleElements: [],
      hiddenElements: [],
      allTextContent: [],
      cssIssues: [],
    };

    // Check all elements for visibility
    const expectedSelectors = [
      { sel: '.hub', label: 'Hub container' },
      { sel: '.hub__texture', label: 'Texture overlay' },
      { sel: '.hub__main', label: 'Main layout' },
      { sel: '.hub__hero', label: 'Hero section' },
      { sel: '.hub__title', label: 'Title container' },
      { sel: '.hub__title-red', label: 'RED text' },
      { sel: '.hub__title-flag', label: 'FLAG text' },
      { sel: '.hub__subtitle', label: 'Games subtitle' },
      { sel: '.hub__ticker', label: 'Ticker marquee' },
      { sel: '.hub__games', label: 'Games container' },
      { sel: '.hub__card--main', label: 'Primary Red Flag Test card' },
      { sel: '.hub__card--green', label: 'Demande à l\'IA card' },
      { sel: '.hub__card--purple', label: 'Red Flag duel card' },
      { sel: '.hub__card-name', label: 'Card game name' },
      { sel: '.hub__card-go', label: 'Card CTA button' },
      { sel: '.hub__footer', label: 'Footer' },
      { sel: '.hub__stats', label: 'Stats bar' },
      { sel: '.hub__actions', label: 'Action buttons' },
      { sel: '.hub__version', label: 'Version text' },
      { sel: 'h1', label: 'H1 tag' },
      { sel: 'h2', label: 'H2 tag' },
      { sel: 'h3', label: 'H3 tag' },
      { sel: 'button', label: 'Any button' },
    ];

    for (const { sel, label } of expectedSelectors) {
      const els = document.querySelectorAll(sel);
      if (els.length === 0) {
        results.hiddenElements.push(`❌ ${label} (${sel}) — NOT FOUND in DOM`);
        continue;
      }
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        const visible = rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0;
        
        if (visible) {
          const text = el.textContent?.trim().substring(0, 80) || '(no text)';
          results.visibleElements.push(
            `✅ ${label} (${sel}) — ${Math.round(rect.width)}×${Math.round(rect.height)}px @ (${Math.round(rect.left)},${Math.round(rect.top)}) — text: "${text}"`
          );
        } else {
          const reasons = [];
          if (rect.width === 0 || rect.height === 0) reasons.push(`size=${Math.round(rect.width)}×${Math.round(rect.height)}`);
          if (styles.display === 'none') reasons.push('display:none');
          if (styles.visibility === 'hidden') reasons.push('visibility:hidden');
          if (parseFloat(styles.opacity) === 0) reasons.push(`opacity:${styles.opacity}`);
          if (rect.top > window.innerHeight) reasons.push(`below viewport: top=${Math.round(rect.top)}`);
          results.hiddenElements.push(`⚠️ ${label} (${sel}) — HIDDEN: ${reasons.join(', ')}`);
        }

        // Check CSS issues
        if (styles.color === styles.backgroundColor && styles.color !== 'rgba(0, 0, 0, 0)') {
          results.cssIssues.push(`🎨 ${label}: text color same as background`);
        }
        if (styles.fontSize === '0px') {
          results.cssIssues.push(`🎨 ${label}: font-size is 0`);
        }
      }
    }

    // Get all visible text
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const t = walker.currentNode.textContent?.trim();
      if (t && t.length > 1) {
        const parent = walker.currentNode.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          const vis = rect.width > 0 && rect.height > 0;
          results.allTextContent.push(`${vis ? '👁️' : '🚫'} "${t.substring(0, 60)}"`);
        }
      }
    }

    return results;
  });

  // Generate report
  const report = [
    `═══════════════════════════════════════════`,
    `  OODA LOOP #${ITERATION} — ${new Date().toLocaleTimeString('fr-FR')}`,
    `═══════════════════════════════════════════`,
    ``,
    `📱 Viewport: 393×852 (iPhone 14 Pro)`,
    `🎨 Body BG: ${analysis.bodyBg}`,
    `🎨 Body Color: ${analysis.bodyColor}`,
    ``,
    `── VISIBLE ELEMENTS ──────────────────────`,
    ...analysis.visibleElements,
    ``,
    `── HIDDEN / MISSING ELEMENTS ─────────────`,
    ...analysis.hiddenElements,
    ``,
    `── CSS ISSUES ────────────────────────────`,
    ...(analysis.cssIssues.length ? analysis.cssIssues : ['None detected']),
    ``,
    `── ALL TEXT CONTENT ──────────────────────`,
    ...analysis.allTextContent,
    ``,
    `── SCREENSHOT ───────────────────────────`,
    `Saved: ${filename}`,
    `═══════════════════════════════════════════`,
  ].join('\n');

  console.log(report);

  // Save report
  fs.writeFileSync(
    path.join(OUT_DIR, `ooda-${ITERATION.padStart(2, '0')}-report.txt`),
    report
  );

  await browser.close();
}

ooda().catch(err => {
  console.error('OODA failed:', err.message);
  process.exit(1);
});
