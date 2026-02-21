/**
 * @file GameModeMenu.test.tsx
 * @description Tests for GameModeMenu category dropdown component.
 * Covers: open/close, category selection, Escape key, default mode.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameModeMenu } from '@/components/game/GameModeMenu';
import type { GameModeSelection } from '@/stores/gameStore';

describe('GameModeMenu', () => {
  const defaultSelection: GameModeSelection = { mode: 'default', category: null };
  const onSelectionChange = vi.fn();

  it('affiche le label "Toutes" en mode default', () => {
    render(<GameModeMenu currentSelection={defaultSelection} onSelectionChange={onSelectionChange} />);
    expect(screen.getByText('Toutes')).toBeDefined();
  });

  it('ouvre le menu au clic sur le bouton', () => {
    render(<GameModeMenu currentSelection={defaultSelection} onSelectionChange={onSelectionChange} />);
    // The button with title "Changer de catégorie"
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    expect(screen.getByText(/Mode de jeu/)).toBeDefined();
    expect(screen.getByText('Classique')).toBeDefined();
  });

  it('affiche les 4 catégories dans le menu', () => {
    render(<GameModeMenu currentSelection={defaultSelection} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    expect(screen.getByText('Sexe & Kinks')).toBeDefined();
    expect(screen.getByText('Lifestyle')).toBeDefined();
    expect(screen.getByText('Quotidien')).toBeDefined();
    expect(screen.getByText('Bureau')).toBeDefined();
  });

  it('appelle onSelectionChange avec la catégorie sélectionnée', () => {
    render(<GameModeMenu currentSelection={defaultSelection} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    fireEvent.click(screen.getByText('Lifestyle'));
    expect(onSelectionChange).toHaveBeenCalledWith({ mode: 'thematique', category: 'lifestyle' });
  });

  it('appelle onSelectionChange en mode default au clic Classique', () => {
    const thematicSelection: GameModeSelection = { mode: 'thematique', category: 'sexe' };
    render(<GameModeMenu currentSelection={thematicSelection} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    fireEvent.click(screen.getByText('Classique'));
    expect(onSelectionChange).toHaveBeenCalledWith({ mode: 'default', category: null });
  });

  it('ferme le menu avec Escape', () => {
    render(<GameModeMenu currentSelection={defaultSelection} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    expect(screen.getByText(/Mode de jeu/)).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    // After Escape, the menu should close (AnimatePresence exit)
    // The menu content should no longer be rendering
    expect(screen.queryByText(/Mode de jeu/)).toBeNull();
  });

  it('affiche le label de la catégorie en mode thématique', () => {
    const thematicSelection: GameModeSelection = { mode: 'thematique', category: 'bureau' };
    render(<GameModeMenu currentSelection={thematicSelection} onSelectionChange={onSelectionChange} />);
    expect(screen.getByText('Bureau')).toBeDefined();
  });

  it('affiche le bouton "Revenir au mode classique" si filtre actif', () => {
    const thematicSelection: GameModeSelection = { mode: 'thematique', category: 'sexe' };
    render(<GameModeMenu currentSelection={thematicSelection} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTitle('Changer de catégorie'));
    expect(screen.getByText(/Revenir au mode classique/)).toBeDefined();
  });
});
