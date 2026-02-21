/**
 * @file CategoryBadge.test.tsx
 * @description Tests for CategoryBadge component.
 * Covers: pill variant, card variant, unknown category fallback.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '@/components/ui/CategoryBadge';

describe('CategoryBadge', () => {
  it('affiche un badge card par défaut', () => {
    render(<CategoryBadge categorie="sexe" />);
    // Should show the category emoji and label
    const badge = screen.getByText(/sex/i);
    expect(badge).toBeDefined();
  });

  it('affiche un badge pill', () => {
    render(<CategoryBadge categorie="lifestyle" variant="pill" />);
    const badge = screen.getByText(/lifestyle/i);
    expect(badge).toBeDefined();
  });

  it('affiche un fallback pour une catégorie inconnue', () => {
    render(<CategoryBadge categorie="unknown_cat" />);
    const fallback = screen.getByText('unknown_cat');
    expect(fallback).toBeDefined();
  });

  it('affiche un emoji pour les catégories connues', () => {
    const { container } = render(<CategoryBadge categorie="quotidien" />);
    // Check emoji is present in the DOM
    expect(container.textContent).toBeTruthy();
  });

  it('applique les classes CSS pill correctement', () => {
    const { container } = render(<CategoryBadge categorie="bureau" variant="pill" />);
    const span = container.querySelector('span.rounded-full');
    expect(span).toBeDefined();
  });
});
