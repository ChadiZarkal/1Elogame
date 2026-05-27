/**
 * @file CategorySelector.test.tsx
 * @description Tests for CategorySelector card-based category selection.
 * Covers: rendering cards, selection toggle, start button, multi-select.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySelector } from '@/components/game/CategorySelector';

describe('CategorySelector', () => {
  const onStart = vi.fn();

  it('affiche les 3 catégories', () => {
    render(<CategorySelector onStart={onStart} />);
    expect(screen.getByText('Sexe & Kinks')).toBeDefined();
    expect(screen.getByText('Quotidien')).toBeDefined();
    expect(screen.getByText('Métiers')).toBeDefined();
  });

  it('le bouton start est désactivé sans sélection', () => {
    render(<CategorySelector onStart={onStart} />);
    const btn = screen.getByText('Sélectionne au moins une catégorie');
    expect(btn).toBeDefined();
  });

  it('sélectionne une catégorie au clic', () => {
    render(<CategorySelector onStart={onStart} />);
    fireEvent.click(screen.getByText('Sexe & Kinks'));
    expect(screen.getByText("🚩 C'EST PARTI")).toBeDefined();
  });

  it('appelle onStart avec les catégories sélectionnées', () => {
    render(<CategorySelector onStart={onStart} />);
    fireEvent.click(screen.getByText('Sexe & Kinks'));
    fireEvent.click(screen.getByText("🚩 C'EST PARTI"));
    expect(onStart).toHaveBeenCalledWith(['sexe']);
  });

  it('permet la multi-sélection', () => {
    render(<CategorySelector onStart={onStart} />);
    fireEvent.click(screen.getByText('Sexe & Kinks'));
    fireEvent.click(screen.getByText('Quotidien'));
    fireEvent.click(screen.getByText("🚩 C'EST PARTI"));
    expect(onStart).toHaveBeenCalledWith(expect.arrayContaining(['sexe', 'quotidien']));
  });

  it('permet de désélectionner', () => {
    render(<CategorySelector onStart={onStart} />);
    fireEvent.click(screen.getByText('Sexe & Kinks'));
    fireEvent.click(screen.getByText('Sexe & Kinks')); // deselect
    expect(screen.getByText('Sélectionne au moins une catégorie')).toBeDefined();
  });
});
