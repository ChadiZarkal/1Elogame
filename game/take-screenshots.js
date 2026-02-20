const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Mobile screenshot
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: 'Screenshots/homepage-mobile-v2.png', fullPage: true });
  console.log('Mobile screenshot saved');

  // Desktop screenshot
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: 'Screenshots/homepage-desktop-v2.png', fullPage: true });
  console.log('Desktop screenshot saved');

  await browser.close();
  console.log('Done!');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
