import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  Post,
  filterPostsByTag,
  filterPostsByCategory,
} from './helpers/taxonomy';

// Feature: personal-blog, Property 6: Taxonomy filtered view correctness

/**
 * **Validates: Requirements 3.2, 3.5**
 *
 * Property 6: For any taxonomy term (tag or category) and any collection of
 * posts, the filtered view for that term SHALL display exactly the set of posts
 * associated with that term, in reverse chronological order by publication date.
 */

/** Generate a valid ISO date string (YYYY-MM-DD) */
const dateArbitrary: fc.Arbitrary<string> = fc
  .date({
    min: new Date('2000-01-01'),
    max: new Date('2030-12-31'),
  })
  .map((d) => d.toISOString().slice(0, 10));

/** Pool of possible tag/category names to pick from */
const taxonomyTermArbitrary: fc.Arbitrary<string> = fc.stringMatching(
  /^[a-z][a-z0-9-]{0,19}$/
);

/** Generate a post with random tags and categories drawn from a shared pool */
function postArbitrary(
  tagPool: string[],
  categoryPool: string[]
): fc.Arbitrary<Post> {
  return fc.record({
    title: fc.string({ minLength: 1, maxLength: 80 }),
    date: dateArbitrary,
    tags: fc
      .subarray(tagPool, { minLength: 1, maxLength: Math.min(10, tagPool.length) })
      .map((arr) => [...new Set(arr)]),
    categories: fc
      .subarray(categoryPool, { minLength: 0, maxLength: Math.min(5, categoryPool.length) })
      .map((arr) => [...new Set(arr)]),
  });
}

/**
 * Generates a test scenario: a pool of tags/categories, a collection of posts
 * using those pools, and a randomly chosen tag and category to filter by.
 */
const scenarioArbitrary = fc
  .array(taxonomyTermArbitrary, { minLength: 2, maxLength: 10 })
  .chain((tagPool) =>
    fc
      .array(taxonomyTermArbitrary, { minLength: 1, maxLength: 5 })
      .chain((categoryPool) =>
        fc
          .array(postArbitrary(tagPool, categoryPool), {
            minLength: 1,
            maxLength: 30,
          })
          .chain((posts) =>
            fc.record({
              posts: fc.constant(posts),
              tagPool: fc.constant(tagPool),
              categoryPool: fc.constant(categoryPool),
              selectedTag: fc.constantFrom(...tagPool),
              selectedCategory: fc.constantFrom(...categoryPool),
            })
          )
      )
  );

describe('Property 6: Taxonomy filtered view correctness', () => {
  it('tag filtered view returns exactly the posts with that tag', () => {
    fc.assert(
      fc.property(scenarioArbitrary, ({ posts, selectedTag }) => {
        const result = filterPostsByTag(posts, selectedTag);

        // Every post in result must have the selected tag
        for (const post of result) {
          expect(post.tags).toContain(selectedTag);
        }

        // Every post in the original collection that has the tag must be in result
        const expectedPosts = posts.filter((p) => p.tags.includes(selectedTag));
        expect(result.length).toBe(expectedPosts.length);
      }),
      { numRuns: 200 }
    );
  });

  it('tag filtered view is sorted in reverse chronological order', () => {
    fc.assert(
      fc.property(scenarioArbitrary, ({ posts, selectedTag }) => {
        const result = filterPostsByTag(posts, selectedTag);

        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i - 1].date).getTime();
          const currDate = new Date(result[i].date).getTime();
          expect(prevDate).toBeGreaterThanOrEqual(currDate);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('category filtered view returns exactly the posts with that category', () => {
    fc.assert(
      fc.property(scenarioArbitrary, ({ posts, selectedCategory }) => {
        const result = filterPostsByCategory(posts, selectedCategory);

        // Every post in result must have the selected category
        for (const post of result) {
          expect(post.categories).toContain(selectedCategory);
        }

        // Every post with the category must be in result
        const expectedPosts = posts.filter((p) =>
          p.categories.includes(selectedCategory)
        );
        expect(result.length).toBe(expectedPosts.length);
      }),
      { numRuns: 200 }
    );
  });

  it('category filtered view is sorted in reverse chronological order', () => {
    fc.assert(
      fc.property(scenarioArbitrary, ({ posts, selectedCategory }) => {
        const result = filterPostsByCategory(posts, selectedCategory);

        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i - 1].date).getTime();
          const currDate = new Date(result[i].date).getTime();
          expect(prevDate).toBeGreaterThanOrEqual(currDate);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('filtered view returns empty array when no posts match', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            date: dateArbitrary,
            tags: fc.constant(['alpha', 'beta']),
            categories: fc.constant(['catA']),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (posts) => {
          const tagResult = filterPostsByTag(posts, 'nonexistent-tag');
          expect(tagResult).toHaveLength(0);

          const catResult = filterPostsByCategory(posts, 'nonexistent-category');
          expect(catResult).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
