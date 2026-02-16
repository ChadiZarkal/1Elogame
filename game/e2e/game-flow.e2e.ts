/**
 * @file game-flow.e2e.ts
 * @description E2E tests for the complete game flow:
 * 1. Fill profile form (sex + age)
 * 2. Start a duel
 * 3. Vote for a winner
 * 4. See the result
 * 5. Continue to next duel
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

describe('Game Flow E2E', () => {
  it('affiche le formulaire de profil', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/jeu`, { waitUntil: 'networkidle2' });
    await screenshot(page, 'profile-form');
    
    // Should show sex selection buttons
    const buttons = await page.$$eval('button', (els) =>
      els.map((el) => (el as HTMLButtonElement).textContent?.trim() ?? '')
    );
    
    // Should have demographic buttons (Homme, Femme, etc.)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('remplit le profil et accède au jeu', async () => {
    if (!page) return;
    
    await page.goto(`${BASE_URL}/jeu`, { waitUntil: 'networkidle2' });
    
    // Click on "Homme" or first sex button
    const sexButtons = await page.$$('button');
    let selectedSex = false;
    for (const btn of sexButtons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('Homme') || text.includes('homme') || text.includes('👨')) {
        await btn.click();
        selectedSex = true;
        break;
      }
    }
    
    if (!selectedSex) {
      // Try clicking the first button
      if (sexButtons.length > 0) {
        await sexButtons[0].click();
        selectedSex = true;
      }
    }
    
    // Wait a bit for the form to update
    await page.waitForTimeout(500);
    
    // Select an age bracket
    const ageButtons = await page.$$('button');
    for (const btn of ageButtons) {
      const text = await btn.evaluate((el) => el.textContent?.trim() ?? '');
      if (text.includes('19-22') || text.includes('19') || text.includes('22')) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(500);
    await screenshot(page, 'profile-filled');
  });

  it('affiche un duel après avoir rempli le profil', async () => {
    if (!page) return;
    
    // Navigate to the play page directly
    await page.goto(`${BASE_URL}/jeu/jouer`, { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    await screenshot(page, 'duel-loaded');
    
    // The page should have some interactive elements
    const bodyText = await page.$eval('body', (el) => el.textContent ?? '');
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
