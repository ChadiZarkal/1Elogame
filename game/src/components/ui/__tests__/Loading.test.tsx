import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, FullPageLoading } from '../Loading';

describe('Loading', () => {
  it('should render with default props', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('should have aria-live="polite"', () => {
    render(<Loading />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('should render text when provided', () => {
    render(<Loading text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not render text when not provided', () => {
    const { container } = render(<Loading />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('should apply size classes', () => {
    const { container } = render(<Loading size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12');
    expect(spinner?.className).toContain('w-12');
  });

  it('should apply custom className', () => {
    const { container } = render(<Loading className="mt-10" />);
    expect(container.firstChild).toHaveClass('mt-10');
  });
});

describe('FullPageLoading', () => {
  it('should render with default text', () => {
    render(<FullPageLoading />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<FullPageLoading text="Patience..." />);
    expect(screen.getByText('Patience...')).toBeInTheDocument();
  });

  it('couvre la fenêtre sans masquer la barre de navigation', () => {
    // `inset-0` faisait disparaître l'en-tête du site à chaque chargement :
    // le seul chemin de sortie s'effaçait, et la hauteur perçue clignotait.
    const { container } = render(<FullPageLoading />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('fixed', 'inset-x-0', 'bottom-0');
    expect(overlay).not.toHaveClass('inset-0');
    expect(overlay.style.top).toBe('var(--header-h, 3rem)');
  });
});
