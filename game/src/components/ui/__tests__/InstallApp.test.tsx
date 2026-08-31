/**
 * @file InstallApp.test.tsx
 * @description Tests de l'invitation à installer l'application.
 * Le point sensible est la persistance du refus : la plainte d'origine était
 * une bannière — celle du navigateur — dont on ne pouvait pas se débarrasser.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { InstallApp } from '@/components/ui/InstallApp';

const DISMISSED_KEY = 'rog_install_dismissed';

/** L'événement que Chrome émet, et que jsdom ne connaît pas. */
function fireInstallPrompt() {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  Object.assign(event, { prompt: vi.fn().mockResolvedValue(undefined) });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe('InstallApp', () => {
  beforeEach(() => {
    localStorage.clear();
    // Sans cette réponse, `matchMedia` n'existe pas dans jsdom.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    });
  });

  it("ne montre rien tant que le navigateur n'a pas propose l'installation", () => {
    render(<InstallApp />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("invite quand le navigateur signale l'application installable", () => {
    render(<InstallApp />);
    fireInstallPrompt();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Installer' })).toBeTruthy();
  });

  it('eteint la banniere du navigateur', () => {
    render(<InstallApp />);
    const event = fireInstallPrompt();
    // C'est `preventDefault` qui fait taire la barre « Ajouter à l'écran
    // d'accueil », le seul moyen documenté de reprendre la main.
    expect(event.defaultPrevented).toBe(true);
  });

  it('retient le refus et ne revient pas', () => {
    render(<InstallApp />);
    fireInstallPrompt();

    act(() => {
      screen.getByRole('button', { name: "Ne plus proposer l'installation" }).click();
    });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('1');

    // Même si le navigateur repropose, l'invitation ne réapparaît pas.
    fireInstallPrompt();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('ne propose plus rien a qui a deja refuse', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    render(<InstallApp />);
    fireInstallPrompt();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("ne propose rien quand l'application tourne deja installee", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query.includes('standalone'),
        addEventListener() {},
        removeEventListener() {},
      }),
    });
    render(<InstallApp />);
    fireInstallPrompt();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
