/**
 * Front matter validation logic for Mind Garden blog posts.
 *
 * A post is valid (included in the generated site) only if it has
 * all three required front matter fields: `title`, `date`, and `layout`.
 * If any of these fields are missing, the post is excluded.
 */

export interface PostFrontMatter {
  title?: string;
  date?: string;
  layout?: string;
  tags?: string[];
  categories?: string[];
  [key: string]: unknown;
}

/**
 * Determines whether a post should be included in the generated site
 * based on its front matter fields.
 *
 * A post is included only if all three required fields are present:
 * - title (non-empty string)
 * - date (non-empty string)
 * - layout (non-empty string)
 *
 * @param frontMatter - The front matter object of a post
 * @returns true if the post should be included, false if it should be excluded
 */
export function isPostValid(frontMatter: PostFrontMatter): boolean {
  const hasTitle =
    typeof frontMatter.title === 'string' && frontMatter.title.trim().length > 0;
  const hasDate =
    typeof frontMatter.date === 'string' && frontMatter.date.trim().length > 0;
  const hasLayout =
    typeof frontMatter.layout === 'string' && frontMatter.layout.trim().length > 0;

  return hasTitle && hasDate && hasLayout;
}

/**
 * Filters a collection of posts, returning only those with valid front matter.
 *
 * @param posts - Array of post front matter objects
 * @returns Array of posts that have all required fields
 */
export function filterValidPosts(posts: PostFrontMatter[]): PostFrontMatter[] {
  return posts.filter(isPostValid);
}
