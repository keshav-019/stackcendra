import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins plain string classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('applies conditional classes via object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('lets a later conflicting Tailwind class win (tailwind-merge)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-white', 'text-black')).toBe('text-black');
  });

  it('keeps non-conflicting classes from both arguments', () => {
    expect(cn('flex items-center', 'gap-2')).toBe('flex items-center gap-2');
  });
});
