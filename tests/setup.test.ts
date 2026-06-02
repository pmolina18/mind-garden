import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('Testing framework setup', () => {
  it('vitest works correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('fast-check works correctly', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
      })
    );
  });
});
