/**
 * @file flashflag.e2e.ts
 * @description E2E smoke tests for Flash Flag Sprint.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Page } from 'puppeteer';
import { createPage, closeBrowser, BASE_URL, screenshot, isServerReady } from './e2e.config';

let page: Page;

beforeAll(async () => {
  const ready = await isServerReady();
  if (!ready) {
    console.warn(`Dev server not reachable at ${BASE_URL}. Skipping E2E tests.`);
    return;
  }
  page = await createPage();
}, 30_000);

afterAll(async () => {
  await closeBrowser();
});

describe('Flash Flag E2E', () => {
  it('charge la page de creation', async () => {
    if (!page) return;

    await page.goto(`${BASE_URL}/flashflag`, { waitUntil: 'networkidle2' });
    await screenshot(page, 'flashflag-loaded');

    const content = await page.content();
    expect(content).toContain('Flash Flag');
  });

  it('peut basculer en mode test perso', async () => {
    if (!page) return;

    await page.goto(`${BASE_URL}/flashflag`, { waitUntil: 'networkidle2' });

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('Perso')) {
        await btn.click();
        break;
      }
    }

    await page.waitForTimeout(500);
    await screenshot(page, 'flashflag-custom-mode');

    const inputs = await page.$$('input');
    expect(inputs.length).toBeGreaterThan(4);
  });

  it('cree une session standard et affiche un lien', async () => {
    if (!page) return;

    await page.goto(`${BASE_URL}/flashflag`, { waitUntil: 'networkidle2' });

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('Envoyer un lien')) {
        await btn.click();
      }
    }

    for (const btn of buttons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('Generer le test')) {
        await btn.click();
        break;
      }
    }

    await page.waitForTimeout(1500);
    await screenshot(page, 'flashflag-link-generated');

    const bodyText = await page.evaluate(() => document.body.textContent || '');
    const hasLink = bodyText.includes('/flashflag/session/') || bodyText.includes('Lien pret');
    expect(hasLink).toBe(true);
  });
});
