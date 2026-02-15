#!/usr/bin/env node
/**
 * Puppeteer Screenshot Script for Red Flag Games
 * Usage: node scripts/screenshot.js [--page <name>] [--all] [--dir <output>]
 * 
 * Pages: home, jeu, jouer, classement, flagornot, admin, admin-dashboard, 
 *        admin-elements, admin-demographics, admin-moderation, admin-stats, admin-categories
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const PAGES = {
  home:                { url: '/',                    name: 'home' },
  jeu:                 { url: '/jeu',                 name: 'jeu' },
  jouer:               { url: '/jeu/jouer',           name: 'jouer' },
  classement:          { url: '/classement',          name: 'classement' },
  flagornot:           { url: '/flagornot',           name: 'flagornot' },
  admin:               { url: '/admin',               name: 'admin-login' },
  'admin-dashboard':   { url: '/admin/dashboard',     name: 'admin-dashboard' },
  'admin-elements':    { url: '/admin/elements',      name: 'admin-elements' },
  'admin-demographics':{ url: '/admin/demographics',  name: 'admin-demographics' },
  'admin-moderation':  { url: '/admin/moderation',    name: 'admin-moderation' },
  'admin-stats':       { url: '/admin/stats',         name: 'admin-stats' },
  'admin-categories':  { url: '/admin/categories',    name: 'admin-categories' },
};

async function takeScreenshot(page, pageConfig, outputDir) {
  const url = `${BASE_URL}${pageConfig.url}`;
  console.log(`  📸 ${pageConfig.name}: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    // Wait a bit for animations to settle
    await new Promise(r => setTimeout(r, 1500));
    
    const filepath = path.join(outputDir, `${pageConfig.name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`     ✅ Saved: ${filepath}`);
    return { success: true, file: filepath };
  } catch (err) {
    console.log(`     ❌ Error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function loginAdmin(page) {
  console.log('  🔐 Logging into admin...');
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 10000 });
    await new Promise(r => setTimeout(r, 500));
    
    // Type password and submit
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.type('admin123');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('     ✅ Logged in');
        return true;
      }
    }
    console.log('     ⚠️ Could not find login form');
    return false;
  } catch (err) {
    console.log(`     ❌ Login failed: ${err.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  // Parse args
  let pagesToCapture = [];
  let outputDir = path.join(__dirname, '..', 'screenshots', timestamp);
  let doAll = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') {
      doAll = true;
    } else if (args[i] === '--page' && args[i + 1]) {
      pagesToCapture.push(args[++i]);
    } else if (args[i] === '--dir' && args[i + 1]) {
      outputDir = args[++i];
    }
  }
  
  if (doAll || pagesToCapture.length === 0) {
    pagesToCapture = Object.keys(PAGES);
  }
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  console.log(`\n🖼️  Red Flag Games — Screenshot Tool`);
  console.log(`📁 Output: ${outputDir}`);
  console.log(`📄 Pages: ${pagesToCapture.join(', ')}\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 390, height: 844 }, // iPhone 14 Pro viewport
  });
  
  const page = await browser.newPage();
  
  // Set mobile user agent
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );
  
  const results = [];
  const adminPages = pagesToCapture.filter(p => p.startsWith('admin-'));
  const publicPages = pagesToCapture.filter(p => !p.startsWith('admin-') && p !== 'admin');
  
  // Public pages first
  for (const pageName of publicPages) {
    const config = PAGES[pageName];
    if (config) {
      const result = await takeScreenshot(page, config, outputDir);
      results.push({ page: pageName, ...result });
    }
  }
  
  // Admin pages (need login first)
  if (adminPages.length > 0 || pagesToCapture.includes('admin')) {
    const loggedIn = await loginAdmin(page);
    
    if (pagesToCapture.includes('admin')) {
      // Screenshot the login page (already on it or just logged in)
      const result = await takeScreenshot(page, PAGES.admin, outputDir);
      results.push({ page: 'admin', ...result });
    }
    
    if (loggedIn) {
      for (const pageName of adminPages) {
        const config = PAGES[pageName];
        if (config) {
          const result = await takeScreenshot(page, config, outputDir);
          results.push({ page: pageName, ...result });
        }
      }
    }
  }
  
  // Also take desktop screenshots for key pages
  console.log('\n  🖥️  Desktop viewport (1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
  
  const desktopPages = ['home', 'classement', 'admin-dashboard', 'admin-demographics'];
  for (const pageName of desktopPages) {
    const config = PAGES[pageName];
    if (config && pagesToCapture.includes(pageName)) {
      const desktopConfig = { ...config, name: `${config.name}-desktop` };
      const result = await takeScreenshot(page, desktopConfig, outputDir);
      results.push({ page: `${pageName}-desktop`, ...result });
    }
  }
  
  await browser.close();
  
  // Summary
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📊 Summary: ${success} ✅ / ${failed} ❌ (${results.length} total)`);
  console.log(`📁 Screenshots: ${outputDir}\n`);
  
  // Write results JSON
  fs.writeFileSync(
    path.join(outputDir, 'results.json'),
    JSON.stringify({ timestamp, results, summary: { success, failed, total: results.length } }, null, 2)
  );
  
  return failed === 0 ? 0 : 1;
}

main().then(code => process.exit(code)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
