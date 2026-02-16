/**
 * @file flagornot.e2e.ts
 * @description E2E tests for the Flag or Not (AI judge) game page.
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

describe('Flag or Not E2E', () => {
  it('charge la page Flag or Not', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/flagornot`, { waitUntil: 'networkidle2' });
    await screenshot(page, 'flagornot-loaded');
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  it('affiche un champ de saisie pour le texte', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/flagornot`, { waitUntil: 'networkidle2' });
    
    // Should have an input field or textarea for the user to type
    const inputs = await page.$$('input[type="text"], textarea');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('peut soumettre un texte pour jugement', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/flagornot`, { waitUntil: 'networkidle2' });
    
    // Type something in the input
    const input = await page.$('input[type="text"], textarea');
    if (input) {
      await input.type('Être gentil avec les gens');
      await screenshot(page, 'flagornot-input-filled');
      
      // Find and click the submit/judge button
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
        if (text.includes('Juge') || text.includes('juge') || text.includes('Envoyer') || text.includes('🔥')) {
          await btn.click();
          break;
        }
      }
      
      // Wait for the AI response (may take a while in real mode)
      await page.waitForTimeout(3000);
      await screenshot(page, 'flagornot-result');
    }
  });
});
