/**
 * @file SiteHeader.test.tsx
 * @description La barre du site, masquée sur l'accueil — y compris quand Next
 * le rend sous `/index`.
 *
 * L'accueil est régénéré en arrière-plan (`revalidate = 300`), et Next le rend
 * alors sous `/index`. La barre s'y affichait côté serveur et pas dans le
 * navigateur : la copie du serveur restait orpheline, et une seconde barre
 * s'y ajoutait au premier clic vers un jeu.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const { chemin } = vi.hoisted(() => ({ chemin: { valeur: '/' as string | null } }));
vi.mock('next/navigation', () => ({ usePathname: () => chemin.valeur }));

import { SiteHeader, normaliserChemin } from '@/components/ui/SiteHeader';

describe('SiteHeader', () => {
  beforeEach(() => { chemin.valeur = '/'; });

  it('ne s’affiche pas sur l’accueil', () => {
    const { container } = render(<SiteHeader />);
    expect(container.querySelector('header')).toBeNull();
  });

  it('ne s’affiche pas non plus quand Next rend l’accueil sous /index', () => {
    chemin.valeur = '/index';
    const { container } = render(<SiteHeader />);
    expect(container.querySelector('header')).toBeNull();
  });

  it('s’affiche sur les pages de jeu', () => {
    chemin.valeur = '/redflagtest';
    const { container } = render(<SiteHeader />);
    expect(container.querySelectorAll('header.barre-site')).toHaveLength(1);
  });
});

describe('normaliserChemin', () => {
  it('ramène /index à l’accueil et laisse le reste intact', () => {
    expect(normaliserChemin('/index')).toBe('/');
    expect(normaliserChemin('/')).toBe('/');
    expect(normaliserChemin('/redflagtest')).toBe('/redflagtest');
    expect(normaliserChemin('/index-des-flags')).toBe('/index-des-flags');
    expect(normaliserChemin(null)).toBe('');
  });
});
