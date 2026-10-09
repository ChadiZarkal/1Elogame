/**
 * @file adminAuth.test.ts
 * @description L'accès à l'administration : fermé sans mot de passe, ouvert
 * avec le bon, et des jetons qui ne survivent pas à un changement de mot de
 * passe.
 */

import { afterEach, describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  adminConfigure,
  authenticateAdmin,
  generateAdminToken,
  validateAdminToken,
  verifierMotDePasse,
} from '@/lib/adminAuth';

function production(motDePasse?: string) {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'false');
  vi.stubEnv('ADMIN_TOKEN_SECRET', '');
  vi.stubEnv('ADMIN_PASSWORD', motDePasse ?? '');
}

const requete = (token?: string) =>
  new NextRequest('http://localhost/api/admin/stats', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sans mot de passe configuré, en production', () => {
  it('reste fermé', () => {
    production();
    expect(adminConfigure()).toBe(false);
    expect(verifierMotDePasse('')).toBe(false);
    expect(verifierMotDePasse('admin')).toBe(false);
  });

  it('ne fabrique ni n’accepte aucun jeton', () => {
    production();
    expect(() => generateAdminToken()).toThrow();
    expect(validateAdminToken(`${Date.now() + 60_000}.abc`)).toBe(false);
    expect(validateAdminToken('open')).toBe(false);
  });

  it('ignore le mode démo en production', () => {
    production();
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true');
    expect(verifierMotDePasse('admin')).toBe(false);
  });
});

describe('avec ADMIN_PASSWORD', () => {
  it('accepte le bon mot de passe et lui seul', () => {
    production('cheval-agrafe-batterie');
    expect(verifierMotDePasse('cheval-agrafe-batterie')).toBe(true);
    expect(verifierMotDePasse('cheval-agrafe')).toBe(false);
    expect(verifierMotDePasse('Cheval-agrafe-batterie')).toBe(false);
    expect(verifierMotDePasse('')).toBe(false);
  });

  it('ignore les espaces autour de la valeur collée dans Vercel', () => {
    production('  cheval-agrafe-batterie \n');
    expect(verifierMotDePasse('cheval-agrafe-batterie')).toBe(true);
  });

  it('délivre un jeton valable quatre heures', () => {
    production('secret');
    const { token, expiresIn } = generateAdminToken();
    expect(expiresIn).toBe(4 * 3600);
    expect(validateAdminToken(token)).toBe(true);
  });

  it('refuse un jeton falsifié ou expiré', () => {
    production('secret');
    const { token } = generateAdminToken();
    const [echeance, signature] = token.split('.');
    expect(validateAdminToken(`${echeance}.${'0'.repeat(signature.length)}`)).toBe(false);
    expect(validateAdminToken(`${Number(echeance) + 1}.${signature}`)).toBe(false);
    expect(validateAdminToken(`${Date.now() - 1000}.${signature}`)).toBe(false);
    expect(validateAdminToken('sans-point')).toBe(false);
  });

  // Après une fuite, changer le mot de passe doit suffire à fermer toutes les
  // sessions ouvertes.
  it('invalide les jetons quand le mot de passe change', () => {
    production('ancien');
    const { token } = generateAdminToken();
    production('nouveau');
    expect(validateAdminToken(token)).toBe(false);
  });
});

describe('authenticateAdmin', () => {
  it('refuse une requête sans jeton', () => {
    production('secret');
    expect(authenticateAdmin(requete())?.status).toBe(401);
  });

  it('refuse l’ancien jeton « open »', () => {
    production('secret');
    expect(authenticateAdmin(requete('open'))?.status).toBe(401);
  });

  it('laisse passer un jeton valide', () => {
    production('secret');
    const { token } = generateAdminToken();
    expect(authenticateAdmin(requete(token))).toBeNull();
  });
});

describe('en développement local, mode démo', () => {
  it('accepte « admin » quand aucun mot de passe n’est posé', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_MOCK_MODE', 'true');
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(verifierMotDePasse('admin')).toBe(true);
    expect(verifierMotDePasse('autre')).toBe(false);
  });
});
