/**
 * Feature: personal-blog, Property 5: Taxonomy listing correctness
 *
 * For any collection of posts with tags/categories, the Tags Page and Categories Page
 * SHALL list each taxonomy term in alphabetical (case-insensitive) order, and the post
 * count displayed next to each term SHALL equal the actual number of posts associated
 * with that term.
 *
 * **Validates: Requirements 3.1, 3.4**
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateTagListing,
  generateCategoryListing,
  Post,
} from './helpers/taxonomy';

// Arbitrary for generating a non-empty tag/category name
const tagArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 -]{0,19}$/);

// Arbitrary for generating a post with random tags and categories
const postArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  date: fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
  }).map((d) => d.toISOString().slice(0, 10)),
  tags: fc.array(tagArb, { minLength: 1, maxLength: 10 }),
  categories: fc.array(tagArb, { minLength: 0, maxLength: 5 }),
});

// Arbitrary for generating a collection of posts
const postsArb = fc.array(postArb, { minLength: 1, maxLength: 30 });

describe('Property 5: Taxonomy listing correctness', () => {
  it('tag listing is sorted alphabetically (case-insensitive)', () => {
    fc.assert(
      fc.property(postsArb, (posts: Post[]) => {
        const listing = generateTagListing(posts);

        // Verify alphabetical order (case-insensitive)
        for (let i = 1; i < listing.length; i++) {
          const cmp = listing[i - 1].name.localeCompare(
            listing[i].name,
            undefined,
            { sensitivity: 'base' }
          );
          expect(cmp).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('tag listing has accurate post counts', () => {
    fc.assert(
      fc.property(postsArb, (posts: Post[]) => {
        const listing = generateTagListing(posts);

        // Compute expected counts manually
        const expectedCounts = new Map<string, number>();
        for (const post of posts) {
          for (const tag of post.tags) {
            expectedCounts.set(tag, (expectedCounts.get(tag) ?? 0) + 1);
          }
        }

        // Verify each entry's count matches the expected count
        for (const entry of listing) {
          expect(entry.postCount).toBe(expectedCounts.get(entry.name));
        }

        // Verify all tags are present in the listing
        expect(listing.length).toBe(expectedCounts.size);
      }),
      { numRuns: 100 }
    );
  });

  it('category listing is sorted alphabetically (case-insensitive)', () => {
    fc.assert(
      fc.property(postsArb, (posts: Post[]) => {
        const listing = generateCategoryListing(posts);

        // Verify alphabetical order (case-insensitive)
        for (let i = 1; i < listing.length; i++) {
          const cmp = listing[i - 1].name.localeCompare(
            listing[i].name,
            undefined,
            { sensitivity: 'base' }
          );
          expect(cmp).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('category listing has accurate post counts', () => {
    fc.assert(
      fc.property(postsArb, (posts: Post[]) => {
        const listing = generateCategoryListing(posts);

        // Compute expected counts manually
        const expectedCounts = new Map<string, number>();
        for (const post of posts) {
          for (const category of post.categories) {
            expectedCounts.set(
              category,
              (expectedCounts.get(category) ?? 0) + 1
            );
          }
        }

        // Verify each entry's count matches the expected count
        for (const entry of listing) {
          expect(entry.postCount).toBe(expectedCounts.get(entry.name));
        }

        // Verify all categories are present in the listing
        expect(listing.length).toBe(expectedCounts.size);
      }),
      { numRuns: 100 }
    );
  });

  it('taxonomy listing only contains terms with at least one post', () => {
    fc.assert(
      fc.property(postsArb, (posts: Post[]) => {
        const tagListing = generateTagListing(posts);
        const categoryListing = generateCategoryListing(posts);

        // Every entry must have a positive post count
        for (const entry of tagListing) {
          expect(entry.postCount).toBeGreaterThan(0);
        }
        for (const entry of categoryListing) {
          expect(entry.postCount).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
