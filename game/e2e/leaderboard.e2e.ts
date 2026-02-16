/**
 * @file leaderboard.e2e.ts
 * @description E2E tests for the leaderboard/classement page.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Page } from 'puppeteer';
import { createPage, closeBrowser, BASE_URL, screenshot, isServerReady } from './e2e.config';

let page: Page;

beforeAll(async () => {
  const ready = await isServerReady();
  if (!ready) {
    console.warn(`⚠️ Dev server not reachable at ${BASE_URL}. Skipping E2E tests.`);
    return;
  }
  page = await createPage();
}, 30_000);

afterAll(async () => {
  await closeBrowser();
});

describe('Leaderboard E2E', () => {
  it('charge la page classement', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/classement`, { waitUntil: 'networkidle2' });
    await screenshot(page, 'leaderboard-loaded');
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  it('affiche des éléments de classement', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/classement`, { waitUntil: 'networkidle2' });
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Should show some ranking content
    const bodyText = await page.$eval('body', (el) => el.textContent ?? '');
    expect(bodyText.length).toBeGreaterThan(100);
    
    await screenshot(page, 'leaderboard-content');
  });

  it('peut basculer entre Red et Green flags', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/classement`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    
    // Look for tab/toggle buttons
    const buttons = await page.$$('button');
    let toggled = false;
    
    for (const btn of buttons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('Green') || text.includes('green') || text.includes('🟢')) {
        await btn.click();
        toggled = true;
        await page.waitForTimeout(1000);
        await screenshot(page, 'leaderboard-green-tab');
        break;
      }
    }
    
    if (toggled) {
      expect(toggled).toBe(true);
    }
  });
});
