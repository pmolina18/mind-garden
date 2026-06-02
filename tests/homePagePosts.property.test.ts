import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { selectHomePagePosts, Post } from './helpers/homePagePosts';

// Feature: personal-blog, Property 1: Home page shows the 10 most recent posts in reverse chronological order

/**
 * **Validates: Requirements 1.3**
 *
 * Property 1: For any set of published posts, the home page listing SHALL
 * contain at most 10 posts, and those posts SHALL be the 10 with the most
 * recent dates, ordered from newest to oldest. If fewer than 10 posts exist,
 * all posts SHALL be shown.
 */

/** Arbitrary that generates a Post with a random date and title */
const postArbitrary: fc.Arbitrary<Post> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  date: fc.date({
    min: new Date('2000-01-01'),
    max: new Date('2030-12-31'),
  }),
});

/** Arbitrary that generates a collection of posts (0 to 50) */
const postsArbitrary: fc.Arbitrary<Post[]> = fc.array(postArbitrary, {
  minLength: 0,
  maxLength: 50,
});

describe('Property 1: Home page shows the 10 most recent posts in reverse chronological order', () => {
  it('selects at most 10 posts', () => {
    fc.assert(
      fc.property(postsArbitrary, (posts) => {
        const result = selectHomePagePosts(posts);
        expect(result.length).toBeLessThanOrEqual(10);
      }),
      { numRuns: 200 }
    );
  });

  it('returns all posts when fewer than 10 exist', () => {
    const fewPostsArbitrary = fc.array(postArbitrary, {
      minLength: 0,
      maxLength: 9,
    });

    fc.assert(
      fc.property(fewPostsArbitrary, (posts) => {
        const result = selectHomePagePosts(posts);
        expect(result.length).toBe(posts.length);
      }),
      { numRuns: 200 }
    );
  });

  it('returns exactly 10 posts when more than 10 exist', () => {
    const manyPostsArbitrary = fc.array(postArbitrary, {
      minLength: 11,
      maxLength: 50,
    });

    fc.assert(
      fc.property(manyPostsArbitrary, (posts) => {
        const result = selectHomePagePosts(posts);
        expect(result.length).toBe(10);
      }),
      { numRuns: 200 }
    );
  });

  it('results are ordered newest to oldest (descending date)', () => {
    fc.assert(
      fc.property(postsArbitrary, (posts) => {
        const result = selectHomePagePosts(posts);
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].date.getTime()).toBeGreaterThanOrEqual(
            result[i].date.getTime()
          );
        }
      }),
      { numRuns: 200 }
    );
  });

  it('selected posts are the ones with the most recent dates', () => {
    fc.assert(
      fc.property(postsArbitrary, (posts) => {
        const result = selectHomePagePosts(posts);
        if (posts.length <= 10) {
          // All posts should be included (in sorted order)
          const sortedAll = [...posts].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          );
          expect(result).toEqual(sortedAll);
        } else {
          // The oldest date in result should be >= all dates NOT in result
          const resultDates = new Set(
            result.map((p) => `${p.title}|${p.date.getTime()}`)
          );
          const excluded = posts.filter(
            (p) => !resultDates.has(`${p.title}|${p.date.getTime()}`)
          );
          const oldestInResult = result[result.length - 1].date.getTime();
          for (const ex of excluded) {
            expect(oldestInResult).toBeGreaterThanOrEqual(ex.date.getTime());
          }
        }
      }),
      { numRuns: 200 }
    );
  });
});
