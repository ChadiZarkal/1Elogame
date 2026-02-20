const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // ─── CHECK HOME CARDS ───
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2500));

  const homeResult = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[aria-label*="Jouer"]');
    const scores = [];

    buttons.forEach((btn, i) => {
      const rect = btn.getBoundingClientRect();
      const cs = getComputedStyle(btn);
      const h2 = btn.querySelector('h2');
      const label = btn.querySelector('span[style*="letterspacing"], span[class*="tracking"]');
      const desc = btn.querySelector('p');
      const arrow = btn.querySelector('[data-lucide], svg');
      const dot = btn.querySelector('.animate-pulse');

      const isVisible = cs.opacity !== '0' && cs.visibility !== 'hidden' && rect.height > 60;

      scores.push({
        index: i,
        isVisible,
        height: rect.height,
        width: rect.width,
        top: rect.top,
        opacity: cs.opacity,
        background: cs.backgroundColor,
        border: cs.border,
        boxShadow: cs.boxShadow ? 'has-shadow' : 'no-shadow',
        h2Text: h2?.textContent?.trim(),
        h2Color: h2 ? getComputedStyle(h2).color : 'none',
        h2FontSize: h2 ? getComputedStyle(h2).fontSize : 'none',
        descText: desc?.textContent?.trim().substring(0, 50),
        hasDot: !!dot,
      });
    });

    // Check header
    const h1 = document.querySelector('h1');
    const gradientEl = document.querySelector('[style*="gradient"]');
    const heroText = document.querySelector('header') || document.querySelector('[role="banner"]');

    // Check trust pills
    const pills = document.querySelectorAll('span[style*="rounded-full"]');

    // Check action bar buttons
    const actionBtns = Array.from(document.querySelectorAll('button')).filter(b => {
      const txt = b.textContent?.trim();
      return txt === 'Classement' || txt?.includes('Partager');
    });

    return {
      cardCount: buttons.length,
      cards: scores,
      h1Text: h1?.textContent?.trim(),
      pageScrollable: document.documentElement.scrollHeight > window.innerHeight,
      pageHeight: document.documentElement.scrollHeight,
      viewportH: window.innerHeight,
      actionBtnCount: actionBtns.length,
      actionBtnTexts: actionBtns.map(b => b.textContent?.trim()),
      hasGradientText: !!gradientEl,
    };
  });

  console.log('=== HOMEPAGE OODA ANALYSIS ===');
  console.log(JSON.stringify(homeResult, null, 2));

  // Score calculation
  const cards = homeResult.cards;
  let score = 0;
  const issues = [];

  if (homeResult.cardCount === 3) { score += 15; } else { issues.push(`Only ${homeResult.cardCount}/3 cards visible`); }
  
  let allVisible = true;
  cards.forEach(c => {
    if (!c.isVisible) { allVisible = false; issues.push(`Card ${c.index} NOT VISIBLE (opacity=${c.opacity}, h=${c.height})`); }
    if (c.height < 70) { issues.push(`Card ${c.index} too short: ${c.height}px`); }
    if (c.h2Color === 'rgba(0, 0, 0, 0)' || c.h2Color === 'transparent') { issues.push(`Card ${c.index} h2 color transparent`); }
  });
  if (allVisible) score += 25;
  
  if (homeResult.h1Text?.includes('Red') && homeResult.h1Text?.includes('Games')) score += 10;
  if (homeResult.actionBtnCount >= 2) score += 10;
  if (homeResult.hasGradientText) score += 5;
  
  // Check card colors are readable
  let colorReadable = true;
  cards.forEach(c => {
    if (!c.h2Text || c.h2Text.length < 3) { colorReadable = false; issues.push(`Card ${c.index} has no readable title`); }
  });
  if (colorReadable) score += 15;
  
  // Check card heights are proper
  const avgHeight = cards.reduce((a, c) => a + c.height, 0) / (cards.length || 1);
  if (avgHeight > 90) { score += 10; } else { issues.push(`Cards too flat: avg ${avgHeight}px (want >90)`); }
  
  // Bonus: social proof dots
  const hasDots = cards.some(c => c.hasDot);
  if (hasDots) score += 5;
  
  // Bonus: page fits viewport on mobile (not requiring scroll)
  if (!homeResult.pageScrollable) score += 5;
  
  console.log(`\n=== SCORE: ${score}/100 ===`);
  console.log('Issues:', issues.length ? issues : ['None!']);
  console.log('Expected to see: 3 colorful game cards, visible text, emoji icons, clear CTAs');
  
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
