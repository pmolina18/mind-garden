/**
 * Validation functions for Mind Garden blog post front matter.
 */

/**
 * Validates that a post's tag list contains between 1 and 10 tags (inclusive).
 * A post must have at least 1 tag and no more than 10 tags.
 *
 * @param tags - Array of tag strings from front matter
 * @returns true if the tag count is valid (1–10), false otherwise
 */
export function validateTagCount(tags: string[]): boolean {
  return tags.length >= 1 && tags.length <= 10;
}
