/**
 * Empty taxonomy exclusion logic for Mind Garden blog.
 *
 * When building a taxonomy listing, only include terms (tags/categories)
 * that have at least one post associated with them. Any term with zero
 * posts should be excluded from the listing.
 *
 * This models the scenario where some tags/categories are "known" (e.g.,
 * previously used) but currently have zero posts after filtering.
 */

export interface Post {
  title: string;
  date: string;
  tags: string[];
  categories: string[];
}

export interface TaxonomyEntry {
  name: string;
  postCount: number;
}

/**
 * Builds a tag listing from posts, excluding any tags with zero posts.
 * Given all known tags and a collection of posts, returns only the tags
 * that have at least one associated post, sorted alphabetically (case-insensitive).
 */
export function buildTagListing(allKnownTags: string[], posts: Post[]): TaxonomyEntry[] {
  const tagCounts = new Map<string, number>();

  // Initialize all known tags with zero count
  for (const tag of allKnownTags) {
    tagCounts.set(tag, 0);
  }

  // Count posts per tag
  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  // Exclude tags with zero posts
  const entries: TaxonomyEntry[] = [];
  for (const [name, count] of tagCounts.entries()) {
    if (count > 0) {
      entries.push({ name, postCount: count });
    }
  }

  // Sort alphabetically (case-insensitive)
  entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return entries;
}

/**
 * Builds a category listing from posts, excluding any categories with zero posts.
 * Given all known categories and a collection of posts, returns only the categories
 * that have at least one associated post, sorted alphabetically (case-insensitive).
 */
export function buildCategoryListing(allKnownCategories: string[], posts: Post[]): TaxonomyEntry[] {
  const categoryCounts = new Map<string, number>();

  // Initialize all known categories with zero count
  for (const category of allKnownCategories) {
    categoryCounts.set(category, 0);
  }

  // Count posts per category
  for (const post of posts) {
    for (const category of post.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  // Exclude categories with zero posts
  const entries: TaxonomyEntry[] = [];
  for (const [name, count] of categoryCounts.entries()) {
    if (count > 0) {
      entries.push({ name, postCount: count });
    }
  }

  // Sort alphabetically (case-insensitive)
  entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return entries;
}
