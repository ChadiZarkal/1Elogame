/**
 * @file articles.test.tsx
 * @description La rubrique `/articles` : chaque article se rend, et aucun
 * lien interne ne mène à une page qui n'existe pas.
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { ARTICLES } from '@/content/articles';
import PageArticle from '@/app/articles/[slug]/page';
import PageArticles from '@/app/articles/page';

const APP = path.resolve(__dirname, '../..');

/** Une adresse interne existe si une page lui correspond dans `src/app`. */
function routeExiste(href: string): boolean {
  const chemin = href.split('#')[0].split('?')[0];
  if (chemin.startsWith('/articles/')) {
    return ARTICLES.some((a) => `/articles/${a.slug}` === chemin);
  }
  if (chemin.startsWith('/ressources/')) {
    return existsSync(path.join(APP, 'ressources', '[slug]', 'page.tsx'));
  }
  return existsSync(path.join(APP, chemin, 'page.tsx')) || chemin === '/';
}

function liensInternes(): string[] {
  const liens: string[] = [];
  for (const a of ARTICLES) {
    const textes = a.blocs.flatMap((b) => {
      if (b.type === 'liste') return b.items;
      if (b.type === 'encadre') return b.paragraphes;
      if (b.type === 'tableau') return [];
      return [b.texte];
    });
    for (const t of textes) {
      for (const m of t.matchAll(/\]\((\/[^)]*)\)/g)) liens.push(m[1]);
    }
    liens.push(...a.suite.map((s) => s.href));
  }
  return liens;
}

describe('articles', () => {
  it('ont chacun une adresse distincte', () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('ne renvoient vers aucune page inexistante', () => {
    const casses = liensInternes().filter((href) => !routeExiste(href));
    expect(casses).toEqual([]);
  });

  it('citent des sources en https', () => {
    for (const a of ARTICLES) {
      for (const s of a.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it.each(ARTICLES.map((a) => [a.slug]))('%s se rend avec son titre, sa date et son balisage', async (slug) => {
    const article = ARTICLES.find((a) => a.slug === slug)!;
    const { container } = render(await PageArticle({ params: Promise.resolve({ slug }) }));
    expect(screen.getByRole('heading', { level: 1, name: article.titre })).toBeDefined();
    expect(screen.getByText(/publié le 29 septembre 2026/)).toBeDefined();
    const blocs = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.textContent ?? '{}'));
    const types = blocs.flatMap((b) => (b['@graph'] ?? [b]).map((x: { '@type': string }) => x['@type']));
    expect(types).toContain('Article');
  });

  it("l'article sur les outils présente chacun d'eux et y renvoie", async () => {
    const { METERS } = await import('@/config/meters-data');
    render(await PageArticle({ params: Promise.resolve({ slug: 'violentometre-consentometre-outils-auto-evaluation' }) }));
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    for (const m of METERS) expect(liens).toContain(`/ressources/${m.slug}`);
  });

  it('la liste renvoie à chaque article', () => {
    render(<PageArticles />);
    const liens = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    for (const a of ARTICLES) expect(liens).toContain(`/articles/${a.slug}`);
  });
});
