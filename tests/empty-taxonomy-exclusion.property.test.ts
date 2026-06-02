import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  buildTagListing,
  buildCategoryListing,
  Post,
} from './helpers/taxonomyExclusion';

// Feature: personal-blog, Property 8: Empty taxonomy exclusion
// **Validates: Requirements 3.6**

/**
 * Property 8: For any tag or category that has zero associated posts
 * in the current site build, that term SHALL NOT appear on the Tags Page
 * or Categories Page respectively.
 */

/** Arbitrary for a taxonomy term (non-empty trimmed string) */
const termArbitrary = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

/**
 * Generates a scenario with known tags split into "used" and "unused" subsets,
 * and posts that only use the "used" tags.
 */
const tagExclusionScenario = fc
  .uniqueArray(termArbitrary, { minLength: 2, maxLength: 15 })
  .chain((allTags) => {
    // Generate a split point so we have at least 1 used and 1 unused tag
    return fc.integer({ min: 1, max: allTags.length - 1 }).chain((splitIndex) => {
      const usedTags = allTags.slice(0, splitIndex);
      const unusedTags = allTags.slice(splitIndex);

      // Generate posts that only reference usedTags
      const postArb = fc.record({
        title: fc.string({ minLength: 1, maxLength: 50 }),
        date: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
          .map(d => d.toISOString().split('T')[0]),
        tags: fc.subarray(usedTags, { minLength: 1 }),
        categories: fc.constant([] as string[]),
      });

      return fc.array(postArb, { minLength: 1, maxLength: 10 }).map((posts) => ({
        allTags,
        usedTags,
        unusedTags,
        posts,
      }));
    });
  });

/**
 * Generates a scenario with known categories split into "used" and "unused" subsets,
 * and posts that only use the "used" categories.
 */
const categoryExclusionScenario = fc
  .uniqueArray(termArbitrary, { minLength: 2, maxLength: 15 })
  .chain((allCategories) => {
    return fc.integer({ min: 1, max: allCategories.length - 1 }).chain((splitIndex) => {
      const usedCategories = allCategories.slice(0, splitIndex);
      const unusedCategories = allCategories.slice(splitIndex);

      const postArb = fc.record({
        title: fc.string({ minLength: 1, maxLength: 50 }),
        date: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
          .map(d => d.toISOString().split('T')[0]),
        tags: fc.constant([] as string[]),
        categories: fc.subarray(usedCategories, { minLength: 1 }),
      });

      return fc.array(postArb, { minLength: 1, maxLength: 10 }).map((posts) => ({
        allCategories,
        usedCategories,
        unusedCategories,
        posts,
      }));
    });
  });

describe('Property 8: Empty taxonomy exclusion', () => {
  it('tags with zero posts are excluded from the listing', () => {
    fc.assert(
      fc.property(tagExclusionScenario, ({ allTags, unusedTags, posts }) => {
        const listing = buildTagListing(allTags, posts);
        const listedNames = listing.map(entry => entry.name);

        // Unused tags (zero posts) must NOT appear in the listing
        for (const unusedTag of unusedTags) {
          expect(listedNames).not.toContain(unusedTag);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('categories with zero posts are excluded from the listing', () => {
    fc.assert(
      fc.property(categoryExclusionScenario, ({ allCategories, unusedCategories, posts }) => {
        const listing = buildCategoryListing(allCategories, posts);
        const listedNames = listing.map(entry => entry.name);

        // Unused categories (zero posts) must NOT appear in the listing
        for (const unusedCategory of unusedCategories) {
          expect(listedNames).not.toContain(unusedCategory);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('tags with at least one post ARE included in the listing', () => {
    fc.assert(
      fc.property(tagExclusionScenario, ({ allTags, usedTags, posts }) => {
        const listing = buildTagListing(allTags, posts);
        const listedNames = listing.map(entry => entry.name);

        // Determine which usedTags actually have posts (subarray might not pick all)
        const tagsInPosts = new Set(posts.flatMap(p => p.tags));

        // Every tag that actually appears in a post must be in the listing
        for (const tag of tagsInPosts) {
          expect(listedNames).toContain(tag);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('categories with at least one post ARE included in the listing', () => {
    fc.assert(
      fc.property(categoryExclusionScenario, ({ allCategories, usedCategories, posts }) => {
        const listing = buildCategoryListing(allCategories, posts);
        const listedNames = listing.map(entry => entry.name);

        // Determine which usedCategories actually have posts
        const categoriesInPosts = new Set(posts.flatMap(p => p.categories));

        // Every category that actually appears in a post must be in the listing
        for (const category of categoriesInPosts) {
          expect(listedNames).toContain(category);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('listing never contains entries with zero post count', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(termArbitrary, { minLength: 1, maxLength: 15 }),
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            date: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') })
              .map(d => d.toISOString().split('T')[0]),
            tags: fc.array(termArbitrary, { minLength: 0, maxLength: 5 }),
            categories: fc.array(termArbitrary, { minLength: 0, maxLength: 3 }),
          }),
          { minLength: 0, maxLength: 10 }
        ),
        (allKnownTerms, posts) => {
          const tagListing = buildTagListing(allKnownTerms, posts);
          const categoryListing = buildCategoryListing(allKnownTerms, posts);

          // Every entry in the listing must have postCount > 0
          for (const entry of tagListing) {
            expect(entry.postCount).toBeGreaterThan(0);
          }
          for (const entry of categoryListing) {
            expect(entry.postCount).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
