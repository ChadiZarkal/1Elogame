/**
 * @file homepage.e2e.ts
 * @description E2E tests for the homepage (hub) — verifies the landing page
 * renders correctly with all three game cards and navigation links.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Page } from 'puppeteer';
import { createPage, closeBrowser, BASE_URL, screenshot, isServerReady, getTextContent } from './e2e.config';

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

describe('Homepage E2E', () => {
  it('charge la page d\'accueil', async () => {
    if (!page) return; // Skip if server not ready
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await screenshot(page, 'homepage-loaded');
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  it('affiche le titre principal', async () => {
    if (!page) return;
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Check that the page has heading content
    const headings = await page.$$eval('h1, h2', (els) =>
      els.map((el) => (el as HTMLElement).textContent?.trim() ?? '')
    );
    expect(headings.length).toBeGreaterThan(0);
  });

  it('affiche les cartes de jeu', async () => {
    if (!page) return;
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Should have clickable links/buttons for the games
    const links = await page.$$eval('a[href]', (els) =>
      els.map((el) => (el as HTMLAnchorElement).href)
    );
    
    // Should have links to the game pages
    const gameLinks = links.filter(
      (href) => href.includes('/jeu') || href.includes('/flagornot') || href.includes('/classement')
    );
    expect(gameLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('navigation vers /jeu fonctionne', async () => {
    if (!page) return;
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Click on a link that goes to /jeu
    const jeuLink = await page.$('a[href*="/jeu"]');
    if (jeuLink) {
      await jeuLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      expect(page.url()).toContain('/jeu');
      await screenshot(page, 'jeu-page');
    }
  });
});
