// Feature: personal-blog, Property 3: Required front matter exclusion
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { isPostValid, filterValidPosts, PostFrontMatter } from './helpers/frontMatterValidation';

/**
 * **Validates: Requirements 2.5**
 *
 * Property 3: Required front matter exclusion
 * For any post file where one or more of the required front matter fields
 * (`title`, `date`, `layout`) is absent, the build process SHALL exclude
 * that post from the generated site output.
 */
describe('Property 3: Required front matter exclusion', () => {
  // Arbitrary for non-empty strings (simulating valid field values)
  const nonEmptyString = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

  // Arbitrary for optional field: either a valid string or undefined
  const optionalField = fc.oneof(nonEmptyString, fc.constant(undefined));

  // Arbitrary for front matter with all three required fields present
  const validFrontMatter: fc.Arbitrary<PostFrontMatter> = fc.record({
    title: nonEmptyString,
    date: nonEmptyString,
    layout: nonEmptyString,
  });

  // Arbitrary for front matter where at least one required field is missing
  const invalidFrontMatter: fc.Arbitrary<PostFrontMatter> = fc
    .record({
      title: optionalField,
      date: optionalField,
      layout: optionalField,
    })
    .filter((fm) => {
      // At least one required field must be missing
      const hasTitle = fm.title !== undefined;
      const hasDate = fm.date !== undefined;
      const hasLayout = fm.layout !== undefined;
      return !(hasTitle && hasDate && hasLayout);
    });

  it('posts with all required fields (title, date, layout) are included', () => {
    fc.assert(
      fc.property(validFrontMatter, (frontMatter) => {
        expect(isPostValid(frontMatter)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('posts missing any required field are excluded', () => {
    fc.assert(
      fc.property(invalidFrontMatter, (frontMatter) => {
        expect(isPostValid(frontMatter)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('filterValidPosts excludes all posts missing required fields from a mixed collection', () => {
    const mixedPostCollection = fc.array(
      fc.record({
        title: optionalField,
        date: optionalField,
        layout: optionalField,
        tags: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 5 }), { nil: undefined }),
        categories: fc.option(fc.array(fc.string(), { minLength: 0, maxLength: 3 }), { nil: undefined }),
      }),
      { minLength: 1, maxLength: 20 }
    );

    fc.assert(
      fc.property(mixedPostCollection, (posts) => {
        const validPosts = filterValidPosts(posts);

        // Every post in the result must have all required fields
        for (const post of validPosts) {
          expect(post.title).toBeDefined();
          expect(typeof post.title).toBe('string');
          expect((post.title as string).trim().length).toBeGreaterThan(0);

          expect(post.date).toBeDefined();
          expect(typeof post.date).toBe('string');
          expect((post.date as string).trim().length).toBeGreaterThan(0);

          expect(post.layout).toBeDefined();
          expect(typeof post.layout).toBe('string');
          expect((post.layout as string).trim().length).toBeGreaterThan(0);
        }

        // Every post NOT in the result must be missing at least one required field
        const excludedPosts = posts.filter((p) => !validPosts.includes(p));
        for (const post of excludedPosts) {
          const missingTitle = post.title === undefined || post.title.trim().length === 0;
          const missingDate = post.date === undefined || post.date.trim().length === 0;
          const missingLayout = post.layout === undefined || post.layout.trim().length === 0;
          expect(missingTitle || missingDate || missingLayout).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('a post missing only title is excluded', () => {
    const missingTitleOnly = fc.record({
      title: fc.constant(undefined),
      date: nonEmptyString,
      layout: nonEmptyString,
    });

    fc.assert(
      fc.property(missingTitleOnly, (frontMatter) => {
        expect(isPostValid(frontMatter)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('a post missing only date is excluded', () => {
    const missingDateOnly = fc.record({
      title: nonEmptyString,
      date: fc.constant(undefined),
      layout: nonEmptyString,
    });

    fc.assert(
      fc.property(missingDateOnly, (frontMatter) => {
        expect(isPostValid(frontMatter)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('a post missing only layout is excluded', () => {
    const missingLayoutOnly = fc.record({
      title: nonEmptyString,
      date: nonEmptyString,
      layout: fc.constant(undefined),
    });

    fc.assert(
      fc.property(missingLayoutOnly, (frontMatter) => {
        expect(isPostValid(frontMatter)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
