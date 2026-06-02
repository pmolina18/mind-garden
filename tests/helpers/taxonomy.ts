/**
 * Taxonomy listing logic for Mind Garden blog.
 *
 * Given a collection of posts with tags/categories, produces a listing
 * of taxonomy terms sorted alphabetically (case-insensitive) with accurate
 * post counts.
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
 * Generates the taxonomy listing for tags from a collection of posts.
 * - Each tag that has at least one associated post is included.
 * - Tags are sorted alphabetically (case-insensitive).
 * - The post count for each tag equals the number of posts with that tag.
 */
export function generateTagListing(posts: Post[]): TaxonomyEntry[] {
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const entries: TaxonomyEntry[] = Array.from(tagCounts.entries()).map(
    ([name, postCount]) => ({ name, postCount })
  );

  entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return entries;
}

/**
 * Generates the taxonomy listing for categories from a collection of posts.
 * - Each category that has at least one associated post is included.
 * - Categories are sorted alphabetically (case-insensitive).
 * - The post count for each category equals the number of posts with that category.
 */
export function generateCategoryListing(posts: Post[]): TaxonomyEntry[] {
  const categoryCounts = new Map<string, number>();

  for (const post of posts) {
    for (const category of post.categories) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  const entries: TaxonomyEntry[] = Array.from(categoryCounts.entries()).map(
    ([name, postCount]) => ({ name, postCount })
  );

  entries.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return entries;
}

/**
 * Filters posts by a given tag and returns them in reverse chronological
 * order (newest first). This mirrors the Jekyll/Liquid logic used in the
 * tag filtered view:
 *   {% assign sorted_posts = posts | sort: "date" | reverse %}
 */
export function filterPostsByTag(posts: Post[], tag: string): Post[] {
  return posts
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Filters posts by a given category and returns them in reverse chronological
 * order (newest first). This mirrors the Jekyll/Liquid logic used in the
 * category filtered view.
 */
export function filterPostsByCategory(posts: Post[], category: string): Post[] {
  return posts
    .filter((post) => post.categories.includes(category))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
