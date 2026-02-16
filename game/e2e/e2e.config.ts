/**
 * @file e2e.config.ts
 * @description Puppeteer E2E test configuration and shared utilities.
 * 
 * Usage: Run `npm run test:e2e` which starts the dev server and runs tests.
 * Tests require a running dev server on port 3000 with NEXT_PUBLIC_MOCK_MODE=true.
 */

import puppeteer, { Browser, Page } from 'puppeteer';

/** Base URL for the development server */
export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

/** Default navigation timeout (ms) */
export const NAV_TIMEOUT = 15_000;

/** Default wait timeout (ms) */
export const WAIT_TIMEOUT = 10_000;

/** Screenshot directory */
export const SCREENSHOTS_DIR = './screenshots/e2e';

let browser: Browser | null = null;

/**
 * Get or create shared browser instance.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

/**
 * Create a new page with default settings.
 */
export async function createPage(): Promise<Page> {
  const b = await getBrowser();
  const page = await b.newPage();
  
  // Set viewport to mobile size (target audience: 18-24)
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14
  
  page.setDefaultNavigationTimeout(NAV_TIMEOUT);
  page.setDefaultTimeout(WAIT_TIMEOUT);
  
  return page;
}

/**
 * Close the shared browser instance.
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Take a screenshot with automatic naming.
 */
export async function screenshot(page: Page, name: string): Promise<void> {
  const { mkdirSync } = await import('fs');
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/${name}.png`,
    fullPage: true,
  });
}

/**
 * Wait for element and return its text content.
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  await page.waitForSelector(selector, { timeout: WAIT_TIMEOUT });
  return page.$eval(selector, (el) => (el as HTMLElement).textContent?.trim() ?? '');
}

/**
 * Check if the dev server is reachable.
 */
export async function isServerReady(): Promise<boolean> {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}
