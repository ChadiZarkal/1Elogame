/**
 * @file alternances.test.ts
 * @description Le site anglais ouvert aux moteurs (2026-11-14).
 *
 * Ce qu'il faut tenir : chaque page présente dans les deux langues cite sa
 * jumelle (`hreflang`) des deux côtés — sinon Google ignore la déclaration —,
 * et le plan du site liste les pages anglaises à côté des françaises.
 */

import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { alternances } from '../alternances';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

const APP = path.resolve(__dirname, '../../../app');

describe('hreflang', () => {
  it('relie une page à sa traduction, dans les deux sens', () => {
    const fr = alternances('fr', '/redflagtest');
    const en = alternances('en', '/redflagtest');
    expect(fr.canonical).toBe('/redflagtest');
    expect(en.canonical).toBe('/en/redflagtest');
    for (const a of [fr, en]) {
      expect(a.languages).toEqual({ fr: '/redflagtest', en: '/en/redflagtest', 'x-default': '/redflagtest' });
    }
    expect(alternances('en', '/').canonical).toBe('/en');
    expect(alternances('fr', '/').languages).toMatchObject({ en: '/en' });
  });

  it('ne déclare pas de traduction pour l’administration', () => {
    expect(alternances('fr', '/dixmais/admin')).toEqual({ canonical: '/dixmais/admin' });
  });

  it('chaque page déclarée d’un côté l’est aussi de l’autre', () => {
    const declarees = { fr: new Set<string>(), en: new Set<string>() };
    for (const f of globSync('**/*.{ts,tsx}', { cwd: APP })) {
      if (f.includes('__tests__')) continue;
      const source = readFileSync(path.join(APP, f), 'utf8');
      for (const m of source.matchAll(/alternances\('(fr|en)', '([^']+)'\)/g)) {
        declarees[m[1] as 'fr' | 'en'].add(m[2]);
      }
      // Plus de page anglaise fermée aux moteurs, hors pages d'état (partie en
      // cours, bilan, page hors ligne), fermées en français aussi.
      if (/^en[\\/]/.test(f) && /index: false/.test(source)) {
        expect(f).toMatch(/jouer|recap|flagornot[\\/]stats|hors-ligne/);
      }
    }
    expect(declarees.fr.size).toBeGreaterThan(15);
    expect([...declarees.en].sort()).toEqual([...declarees.fr].sort());
  });
});

describe('plan du site', () => {
  const pages = sitemap();
  const base = 'https://redorgreen.fr';

  it('liste chaque page française et sa version anglaise', () => {
    const urls = new Set(pages.map((p) => p.url));
    expect(urls.has(`${base}/en`)).toBe(true);
    expect(urls.has(`${base}/en/redflagtest`)).toBe(true);
    expect(urls.has(`${base}/en/dixmais`)).toBe(true);
    expect(urls.has(`${base}/en/articles/red-flags-hommes-femmes-presque-d-accord`)).toBe(true);
    expect(urls.has(`${base}/en/ressources/violentometre`)).toBe(true);
    const francaises = pages.filter((p) => !p.url.startsWith(`${base}/en`));
    const anglaises = pages.filter((p) => p.url.startsWith(`${base}/en`));
    expect(anglaises.length).toBe(francaises.length);
  });

  it('déclare les deux langues sur chaque entrée', () => {
    for (const p of pages) {
      const l = p.alternates?.languages as Record<string, string>;
      expect(l, p.url).toBeDefined();
      expect([l.fr, l.en]).toContain(p.url);
      expect(l['x-default']).toBe(l.fr);
    }
  });

  it('robots.txt laisse passer /en', () => {
    const regles = robots().rules;
    const allow = (Array.isArray(regles) ? regles[0] : regles).allow;
    expect(allow).toContain('/en');
  });
});
