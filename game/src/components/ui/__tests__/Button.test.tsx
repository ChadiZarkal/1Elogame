import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Chargement...');
  });

  it('should apply variant classes', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('bg-[#991B1B]');
  });

  it('should apply size classes', () => {
    const { container } = render(<Button size="lg">Big</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('px-8');
  });

  it('should merge custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>);
    const btn = container.querySelector('button');
    expect(btn?.className).toContain('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Test</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
