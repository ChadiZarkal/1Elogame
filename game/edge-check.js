const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const pages = ['/', '/jeu', '/flagornot', '/classement', '/admin', '/jeu/jouer', '/redflag'];
  for (const path of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
    await tab.goto('http://localhost:3000' + path, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    const result = await tab.evaluate(() => {
      const allText = document.querySelectorAll('p, span, h1, h2, h3, h4, label, button');
      let touchesLeft = [];
      let touchesRight = [];
      allText.forEach(el => {
        const r = el.getBoundingClientRect();
        const text = el.textContent || '';
        if (r.width <= 0 || text.trim().length === 0) return;
        if (r.left < 8) touchesLeft.push({text: text.trim().substring(0,25), left: Math.round(r.left)});
        if (r.right > window.innerWidth - 8) touchesRight.push({text: text.trim().substring(0,25), right: Math.round(r.right - window.innerWidth)});
      });
      
      const first = document.body.firstElementChild;
      const second = first ? first.firstElementChild : null;
      const el = second || first;
      const pl = el ? parseFloat(getComputedStyle(el).paddingLeft) : -1;
      const pr = el ? parseFloat(getComputedStyle(el).paddingRight) : -1;
      const tag = el ? el.tagName + '.' + Array.from(el.classList).slice(0,3).join('.') : 'none';
      
      return { touchesLeft: touchesLeft.slice(0,3), touchesRight: touchesRight.slice(0,3), firstChild: tag, padding: {left: pl, right: pr} };
    });
    console.log(`\n${path}:`);
    console.log(`  First child: ${result.firstChild}, padding: L=${result.padding.left} R=${result.padding.right}`);
    if (result.touchesLeft.length) console.log('  Touches LEFT edge:', JSON.stringify(result.touchesLeft));
    if (result.touchesRight.length) console.log('  Touches RIGHT edge:', JSON.stringify(result.touchesRight));
    if (result.touchesLeft.length === 0 && result.touchesRight.length === 0) console.log('  ✅ No content touches edges');
    await tab.close();
  }
  await browser.close();
})();
