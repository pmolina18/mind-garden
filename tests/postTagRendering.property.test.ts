import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderPostTags, slugify } from './helpers/postTagRendering';

// Feature: personal-blog, Property 7: Post tag rendering

/**
 * **Validates: Requirements 3.3**
 *
 * Property 7: For any post with N tags (where 1 ≤ N ≤ 10), the rendered
 * post page SHALL display all N tags as clickable links, and each link SHALL
 * point to the corresponding tag's filtered view on the Tags Page.
 */

/** Arbitrary that generates a valid tag name (non-empty, printable) */
const tagArbitrary: fc.Arbitrary<string> = fc.stringMatching(
  /^[A-Za-z][A-Za-z0-9 _-]{0,29}$/
);

/** Arbitrary that generates a tag set of 1–10 unique tags */
const tagSetArbitrary: fc.Arbitrary<string[]> = fc
  .uniqueArray(tagArbitrary, { minLength: 1, maxLength: 10 })
  .filter((tags) => tags.length >= 1);

describe('Property 7: Post tag rendering', () => {
  it('renders exactly N tag links for a post with N tags', () => {
    fc.assert(
      fc.property(tagSetArbitrary, (tags) => {
        const result = renderPostTags(tags);
        expect(result.tagLinks.length).toBe(tags.length);
      }),
      { numRuns: 200 }
    );
  });

  it('every tag in the post appears as a rendered tag link', () => {
    fc.assert(
      fc.property(tagSetArbitrary, (tags) => {
        const result = renderPostTags(tags);
        const renderedTexts = result.tagLinks.map((link) => link.text);
        for (const tag of tags) {
          expect(renderedTexts).toContain(tag);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('each tag link points to /tags/#slugified-tag-name', () => {
    fc.assert(
      fc.property(tagSetArbitrary, (tags) => {
        const result = renderPostTags(tags);
        for (const tagLink of result.tagLinks) {
          const expectedHref = `/tags/#${slugify(tagLink.text)}`;
          expect(tagLink.href).toBe(expectedHref);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('tag links preserve the original tag display text', () => {
    fc.assert(
      fc.property(tagSetArbitrary, (tags) => {
        const result = renderPostTags(tags);
        for (let i = 0; i < tags.length; i++) {
          expect(result.tagLinks[i].text).toBe(tags[i]);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('tag links maintain the same order as input tags', () => {
    fc.assert(
      fc.property(tagSetArbitrary, (tags) => {
        const result = renderPostTags(tags);
        const renderedTexts = result.tagLinks.map((link) => link.text);
        expect(renderedTexts).toEqual(tags);
      }),
      { numRuns: 200 }
    );
  });
});
