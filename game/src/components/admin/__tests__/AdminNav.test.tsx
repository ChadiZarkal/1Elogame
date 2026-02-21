/**
 * @file AdminNav.test.tsx
 * @description Tests for AdminNav — active state, navigation links, logout.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminNav } from '@/components/admin/AdminNav';

const mockPush = vi.fn();
let currentPathname = '/admin/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(),
}));

describe('AdminNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/admin/dashboard';
    sessionStorage.clear();
    localStorage.clear();
  });

  it('affiche tous les liens de navigation', () => {
    render(<AdminNav />);
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Éléments')).toBeDefined();
    expect(screen.getByText('Algorithme')).toBeDefined();
    expect(screen.getByText('Statistiques')).toBeDefined();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<AdminNav />);
    expect(screen.getByText('Déco')).toBeDefined();
  });

  it('supprime les tokens au logout', () => {
    sessionStorage.setItem('adminToken', 'test');
    localStorage.setItem('rog_admin_token', 'test');

    render(<AdminNav />);
    fireEvent.click(screen.getByText('Déco'));

    expect(sessionStorage.getItem('adminToken')).toBeNull();
    expect(localStorage.getItem('rog_admin_token')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/admin');
  });

  it('affiche le lien vers le site', () => {
    render(<AdminNav />);
    expect(screen.getByText('↗ Site')).toBeDefined();
  });

  it('affiche le label court sur mobile', () => {
    render(<AdminNav />);
    // Short labels are always rendered but shown/hidden via CSS
    expect(screen.getByText('Élém.')).toBeDefined();
    expect(screen.getByText('Stats')).toBeDefined();
  });
});
