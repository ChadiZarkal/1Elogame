const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, 'Screenshots', 'ooda-loops');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await page.goto('http://localhost:3000/flagornot', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, 'ooda-21-flagornot.png'), fullPage: false });

  const title = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.textContent : 'NOT FOUND';
  });
  const heading = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    return h2 ? h2.textContent : 'NOT FOUND';
  });
  console.log('Page title (h1):', title);
  console.log('Main heading (h2):', heading);
  await browser.close();
})();
