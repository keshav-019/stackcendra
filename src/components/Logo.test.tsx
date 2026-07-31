import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo, LogoMark } from './Logo';

describe('LogoMark', () => {
  it('renders as an accessible image labeled StackCendra', () => {
    render(<LogoMark />);
    expect(screen.getByRole('img', { name: 'StackCendra' })).toBeInTheDocument();
  });

  it('respects a custom size', () => {
    render(<LogoMark size={64} />);
    const svg = screen.getByRole('img', { name: 'StackCendra' });
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('defaults to size 32 when no size is given', () => {
    render(<LogoMark />);
    const svg = screen.getByRole('img', { name: 'StackCendra' });
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});

describe('Logo', () => {
  it('renders both the mark and the StackCendra wordmark text', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: 'StackCendra' })).toBeInTheDocument();
    expect(screen.getByText('StackCendra')).toBeInTheDocument();
  });
});
