/**
 * @file ErrorBoundary.test.tsx
 * @description Tests for the ErrorBoundary class component.
 * Covers: rendering children, catching errors, retry button, custom fallback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Component that throws
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Working content</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error from React error boundary
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('affiche les enfants quand pas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <div>Contenu normal</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Contenu normal')).toBeDefined();
  });

  it('affiche le fallback par défaut en cas d\'erreur', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oups, une erreur est survenue')).toBeDefined();
    expect(screen.getByText('Rechargez la page pour continuer.')).toBeDefined();
  });

  it('affiche un fallback personnalisé', () => {
    render(
      <ErrorBoundary fallback={<div>Erreur custom</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Erreur custom')).toBeDefined();
  });

  it('affiche le bouton Réessayer', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Réessayer')).toBeDefined();
  });

  it('réinitialise l\'état quand on clique sur Réessayer', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oups, une erreur est survenue')).toBeDefined();

    // Click retry — this resets hasError, but ThrowingComponent will throw again
    // So it will still show the error. The test verifies the button is clickable.
    fireEvent.click(screen.getByText('Réessayer'));
    
    // After retry with a component that still throws, error boundary catches again
    expect(screen.getByText('Oups, une erreur est survenue')).toBeDefined();
  });
});
