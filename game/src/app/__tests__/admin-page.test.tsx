/**
 * @file admin-page.test.tsx
 * @description Tests for AdminLoginPage — form rendering, validation, login flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLoginPage from '@/app/admin/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('affiche le formulaire de connexion', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText(/Admin/)).toBeDefined();
    expect(screen.getByText(/Panel/)).toBeDefined();
    expect(screen.getByLabelText('Mot de passe')).toBeDefined();
    expect(screen.getByText('Se connecter')).toBeDefined();
  });

  it('affiche le lien retour au jeu', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText(/Retour au jeu/)).toBeDefined();
  });

  it('permet de saisir un mot de passe', async () => {
    render(<AdminLoginPage />);
    const input = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    // Use native input event for controlled components
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'secret');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fireEvent.change(input, { target: { value: 'secret' } });
    await waitFor(() => {
      expect(input.value).toBe('secret');
    });
  });

  it('redirige vers le dashboard après login réussi', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { token: 'abc123' } }),
    }) as unknown as typeof fetch;

    render(<AdminLoginPage />);
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'admin' } });
    fireEvent.submit(screen.getByText('Se connecter'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
    expect(sessionStorage.getItem('adminToken')).toBe('abc123');
  });

  it('affiche une erreur si le mot de passe est incorrect', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: { message: 'Mot de passe incorrect' } }),
    }) as unknown as typeof fetch;

    render(<AdminLoginPage />);
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByText('Se connecter'));

    await waitFor(() => {
      expect(screen.getByText('Mot de passe incorrect')).toBeDefined();
    });
  });

  it('affiche une erreur en cas de problème réseau', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network')) as unknown as typeof fetch;

    render(<AdminLoginPage />);
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'test' } });
    fireEvent.submit(screen.getByText('Se connecter'));

    await waitFor(() => {
      expect(screen.getByText('Erreur de connexion')).toBeDefined();
    });
  });

  it('affiche le bouton toggle du mot de passe', () => {
    render(<AdminLoginPage />);
    const input = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    expect(input.type).toBe('password');
    // Toggle button is present
    expect(screen.getByText('👁️')).toBeDefined();
  });
});
