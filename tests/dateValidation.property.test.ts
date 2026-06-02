import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isValidDateFormat } from './helpers/dateValidation';

// Feature: personal-blog, Property 4: Date format validation
// **Validates: Requirements 2.6**

describe('Property 4: Date format validation', () => {
  /**
   * Helper: generate a valid YYYY-MM-DD date string.
   * Generates year, month, day and ensures the day is valid for the month/year.
   */
  const validDateArb = fc
    .record({
      year: fc.integer({ min: 1900, max: 2100 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 31 }),
    })
    .filter(({ year, month, day }) => {
      // Filter to only real calendar dates
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    })
    .map(({ year, month, day }) => {
      const y = String(year).padStart(4, '0');
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      return `${y}-${m}-${d}`;
    });

  /**
   * Arbitrary for invalid date formats — strings that should be rejected.
   */
  const invalidDateFormats = fc.oneof(
    // Wrong separators
    fc.tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 })
    ).map(([y, m, d]) => `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`),
    // Missing leading zeros
    fc.tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 1, max: 9 }),
      fc.integer({ min: 1, max: 9 })
    ).map(([y, m, d]) => `${y}-${m}-${d}`),
    // Invalid month (13-99)
    fc.tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 13, max: 99 }),
      fc.integer({ min: 1, max: 28 })
    ).map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`),
    // Impossible day for month (e.g., Feb 30, Apr 31)
    fc.constantFrom(
      '2024-02-30', '2024-02-31', '2023-02-29', '2024-04-31',
      '2024-06-31', '2024-09-31', '2024-11-31'
    ),
    // Full ISO datetime (not just date)
    fc.tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 })
    ).map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T12:00:00Z`),
    // Random non-date strings
    fc.stringOf(fc.constantFrom('a', 'b', 'c', '1', '2', ' ', '-', '/'), { minLength: 1, maxLength: 15 })
      .filter(s => !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(s)),
    // Empty string
    fc.constant(''),
    // Only year
    fc.integer({ min: 2000, max: 2030 }).map(y => `${y}`),
    // Year-month only
    fc.tuple(
      fc.integer({ min: 2000, max: 2030 }),
      fc.integer({ min: 1, max: 12 })
    ).map(([y, m]) => `${y}-${String(m).padStart(2, '0')}`),
  );

  it('should accept all valid ISO 8601 YYYY-MM-DD dates', () => {
    fc.assert(
      fc.property(validDateArb, (dateStr) => {
        expect(isValidDateFormat(dateStr)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('should reject all invalid date formats', () => {
    fc.assert(
      fc.property(invalidDateFormats, (dateStr) => {
        expect(isValidDateFormat(dateStr)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('should reject dates with invalid day for the given month (impossible dates)', () => {
    // Generate dates where day is beyond the valid range for the month
    const impossibleDateArb = fc
      .record({
        year: fc.integer({ min: 1900, max: 2100 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 29, max: 31 }),
      })
      .filter(({ year, month, day }) => {
        // Only keep combinations where the day is impossible
        const date = new Date(year, month - 1, day);
        return !(
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      })
      .map(({ year, month, day }) => {
        const y = String(year).padStart(4, '0');
        const m = String(month).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${y}-${m}-${d}`;
      });

    fc.assert(
      fc.property(impossibleDateArb, (dateStr) => {
        expect(isValidDateFormat(dateStr)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it('should handle leap year dates correctly', () => {
    // Feb 29 on leap years should be valid
    const leapYearArb = fc
      .integer({ min: 1904, max: 2096 })
      .filter((year) => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      })
      .map((year) => `${year}-02-29`);

    fc.assert(
      fc.property(leapYearArb, (dateStr) => {
        expect(isValidDateFormat(dateStr)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject Feb 29 on non-leap years', () => {
    const nonLeapYearArb = fc
      .integer({ min: 1901, max: 2099 })
      .filter((year) => {
        return !((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
      })
      .map((year) => `${year}-02-29`);

    fc.assert(
      fc.property(nonLeapYearArb, (dateStr) => {
        expect(isValidDateFormat(dateStr)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
