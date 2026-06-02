import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateTagCount } from '../src/validators';

// Feature: personal-blog, Property 2: Tag count validation
// **Validates: Requirements 2.4**

describe('Property 2: Tag count validation', () => {
  const tagArbitrary = fc.string({ minLength: 1, maxLength: 30 });

  it('accepts tag lists with 1 to 10 tags', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 10 }),
        (tags) => {
          expect(validateTagCount(tags)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects an empty tag list (0 tags)', () => {
    fc.assert(
      fc.property(
        fc.constant([] as string[]),
        (tags) => {
          expect(validateTagCount(tags)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects tag lists with more than 10 tags', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 11, maxLength: 15 }),
        (tags) => {
          expect(validateTagCount(tags)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('correctly classifies random tag lists of length 0–15', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 0, maxLength: 15 }),
        (tags) => {
          const result = validateTagCount(tags);
          const expected = tags.length >= 1 && tags.length <= 10;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
