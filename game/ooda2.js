const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  
  const pages = [
    { name: 'Duel (after start)', url: 'http://localhost:3000/jeu', clickSel: 'button', waitMs: 3000 },
    { name: 'Flag or Not', url: 'http://localhost:3000/flagornot', clickSel: null, waitMs: 2000 },
    { name: 'Classement', url: 'http://localhost:3000/classement', clickSel: null, waitMs: 2000 },
  ];

  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, p.waitMs));

    if (p.clickSel) {
      const btn = await page.$(p.clickSel);
      if (btn) await btn.click().catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    }

    const res = await page.evaluate(() => {
      const issues = [];
      const metrics = {};

      // Check for loading spinners
      const spinners = document.querySelectorAll('[class*="spin"], [class*="loading"], [class*="pulse"]');
      metrics.spinnerCount = spinners.length;
      metrics.spinnerTexts = [...spinners].map(s => s.textContent?.trim()).filter(Boolean);

      // Check for skeletons
      const skels = document.querySelectorAll('[class*="skeleton"], [class*="shimmer"]');
      metrics.skeletonCount = skels.length;

      // Check for error messages
      const allText = document.body.textContent;
      const hasPrepMsg = allText.includes('Préparation') || allText.includes('Chargement');
      const hasError = allText.includes('Erreur') || allText.includes('erreur');
      const hasContent = document.querySelectorAll('section, main, [role="main"]').length > 0;
      
      metrics.isPrepLoading = hasPrepMsg;
      metrics.hasError = hasError;
      metrics.hasContent = hasContent;

      // H1, H2s
      const headings = [...document.querySelectorAll('h1, h2, h3')];
      metrics.headings = headings.slice(0, 5).map(h => ({ tag: h.tagName, text: h.textContent?.trim().substring(0, 60) }));

      // Buttons
      const buttons = document.querySelectorAll('button');
      metrics.btnCount = buttons.length;
      metrics.btnTexts = [...buttons].slice(0, 5).map(b => b.textContent?.trim().substring(0, 30));

      // Page background
      metrics.bgColor = getComputedStyle(document.body).backgroundColor;

      // Check input / textarea
      const inputs = document.querySelectorAll('input, textarea');
      metrics.inputCount = inputs.length;

      // Image count
      metrics.imgCount = document.querySelectorAll('img').length;

      return metrics;
    });

    console.log(`\n=== ${p.name.toUpperCase()} ===`);
    console.log(JSON.stringify(res, null, 2));
    await page.close();
  }

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
