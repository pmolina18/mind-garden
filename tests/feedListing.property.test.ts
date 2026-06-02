import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { selectFeedPosts, FeedPost } from './helpers/feedListing';

// Feature: personal-blog, Property 10: Feed listing correctness

/**
 * **Validates: Requirements 8.2**
 *
 * Property 10: For any set of published posts, the Atom feed SHALL contain
 * at most 20 entries, those entries SHALL be the 20 most recent posts by
 * publication date, and they SHALL be ordered from newest to oldest.
 * If fewer than 20 posts exist, all posts SHALL be included.
 */

/** Arbitrary that generates a FeedPost with a random date and title */
const feedPostArbitrary: fc.Arbitrary<FeedPost> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  date: fc.date({
    min: new Date('2000-01-01'),
    max: new Date('2030-12-31'),
  }),
});

/** Arbitrary that generates a large collection of posts (20 to 100) */
const largePostsArbitrary: fc.Arbitrary<FeedPost[]> = fc.array(feedPostArbitrary, {
  minLength: 20,
  maxLength: 100,
});

/** Arbitrary that generates any collection of posts (0 to 100) */
const anyPostsArbitrary: fc.Arbitrary<FeedPost[]> = fc.array(feedPostArbitrary, {
  minLength: 0,
  maxLength: 100,
});

describe('Property 10: Feed listing correctness', () => {
  it('feed contains at most 20 entries', () => {
    fc.assert(
      fc.property(anyPostsArbitrary, (posts) => {
        const result = selectFeedPosts(posts);
        expect(result.length).toBeLessThanOrEqual(20);
      }),
      { numRuns: 200 }
    );
  });

  it('returns all posts when fewer than 20 exist', () => {
    const fewPostsArbitrary = fc.array(feedPostArbitrary, {
      minLength: 0,
      maxLength: 19,
    });

    fc.assert(
      fc.property(fewPostsArbitrary, (posts) => {
        const result = selectFeedPosts(posts);
        expect(result.length).toBe(posts.length);
      }),
      { numRuns: 200 }
    );
  });

  it('returns exactly 20 posts when more than 20 exist', () => {
    const manyPostsArbitrary = fc.array(feedPostArbitrary, {
      minLength: 21,
      maxLength: 100,
    });

    fc.assert(
      fc.property(manyPostsArbitrary, (posts) => {
        const result = selectFeedPosts(posts);
        expect(result.length).toBe(20);
      }),
      { numRuns: 200 }
    );
  });

  it('results are ordered newest to oldest (descending date)', () => {
    fc.assert(
      fc.property(largePostsArbitrary, (posts) => {
        const result = selectFeedPosts(posts);
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].date.getTime()).toBeGreaterThanOrEqual(
            result[i].date.getTime()
          );
        }
      }),
      { numRuns: 200 }
    );
  });

  it('selected posts are the 20 most recent by publication date', () => {
    fc.assert(
      fc.property(largePostsArbitrary, (posts) => {
        const result = selectFeedPosts(posts);
        if (posts.length <= 20) {
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
