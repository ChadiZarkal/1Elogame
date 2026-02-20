const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // ─── ANALYZE HOME ───
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  const homeAnalysis = await page.evaluate(() => {
    const cards = document.querySelectorAll('button[class*="backdrop-blur"]');
    const result = { cardCount: cards.length, cards: [] };
    cards.forEach((card, i) => {
      const cs = getComputedStyle(card);
      const h2 = card.querySelector('h2');
      const p = card.querySelector('p');
      const rect = card.getBoundingClientRect();
      const opacity = cs.opacity;
      const visibility = cs.visibility;
      const display = cs.display;
      const pointerEvents = cs.pointerEvents;
      const h2Color = h2 ? getComputedStyle(h2).color : 'none';
      const h2Computed = h2 ? {
        color: h2Color,
        fontSize: getComputedStyle(h2).fontSize,
        fontWeight: getComputedStyle(h2).fontWeight,
        visibility: getComputedStyle(h2).visibility,
        opacity: getComputedStyle(h2).opacity,
      } : null;
      // Check if card is genuinely visible to user
      const isActuallyVisible = opacity !== '0' && visibility !== 'hidden' && display !== 'none'
        && rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight;
      result.cards.push({
        index: i,
        text: card.textContent?.trim().substring(0, 60),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        opacity, visibility, display, pointerEvents,
        bgColor: cs.backgroundColor,
        isActuallyVisible,
        h2Computed,
      });
    });
    // Also check stagger container (motion.section)
    const section = document.querySelector('section[aria-label]');
    const sectionStyle = section ? {
      opacity: getComputedStyle(section).opacity,
      visibility: getComputedStyle(section).visibility,
      height: getComputedStyle(section).height,
    } : null;
    result.gameSection = sectionStyle;
    return result;
  });
  console.log('=== HOME CARDS ===');
  console.log(JSON.stringify(homeAnalysis, null, 2));

  // ─── ANALYZE /jeu DUEL LOAD BUG ───
  await page.goto('http://localhost:3000/jeu', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  // Click Homme
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const txt = await btn.evaluate(el => el.textContent);
    if (txt && txt.includes('Homme')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 300));
  const allBtns2 = await page.$$('button');
  for (const btn of allBtns2) {
    const txt = await btn.evaluate(el => el.textContent);
    if (txt && txt.includes('19-22')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 300));
  const allBtns3 = await page.$$('button');
  for (const btn of allBtns3) {
    const txt = await btn.evaluate(el => el.textContent);
    if (txt && (txt.includes('PARTI') || txt.includes('Commencer') || txt.includes('JOUER'))) {
      await btn.click(); break;
    }
  }
  await new Promise(r => setTimeout(r, 4000));

  const jeuAnalysis = await page.evaluate(() => {
    const url = window.location.href;
    const bodyText = document.body.innerText.substring(0, 500);
    const loadingSpinner = !!document.querySelector('[class*="spin"], [class*="loading"], [class*="loader"]');
    const errorEl = document.querySelector('[class*="error"], [class*="Error"]');
    const networkErrors = [];
    return { url, bodyText, loadingSpinner, hasError: !!errorEl, errorText: errorEl?.textContent };
  });
  console.log('\n=== JEU DUEL STATE ===');
  console.log(JSON.stringify(jeuAnalysis, null, 2));
  console.log('Current URL:', await page.url());

  // intercept console errors
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  await page.goto('http://localhost:3000/jeu', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 500));
  // re-click
  const btnX = await page.$$('button');
  for (const btn of btnX) { const t = await btn.evaluate(el => el.textContent); if (t && t.includes('Homme')) { await btn.click(); break; } }
  await new Promise(r => setTimeout(r, 200));
  const btnX2 = await page.$$('button');
  for (const btn of btnX2) { const t = await btn.evaluate(el => el.textContent); if (t && t.includes('19-22')) { await btn.click(); break; } }
  await new Promise(r => setTimeout(r, 200));
  const btnX3 = await page.$$('button');
  for (const btn of btnX3) { const t = await btn.evaluate(el => el.textContent); if (t && (t.includes('PARTI') || t.includes('JOUER'))) { await btn.click(); break; } }
  await new Promise(r => setTimeout(r, 3000));
  console.log('\n=== CONSOLE ERRORS ===');
  console.log(consoleErrors.slice(0, 10));

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
