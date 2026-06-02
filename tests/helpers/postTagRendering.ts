/**
 * Post tag rendering logic for Mind Garden blog.
 *
 * Given a post with tags, generates rendered tag links where each tag
 * links to `/tags/#tag-name` (slugified). This mirrors the Jekyll/Liquid
 * template logic in `_layouts/post.html`:
 *
 *   {% for tag in page.tags %}
 *     <a href="{{ '/tags/' | relative_url }}#{{ tag | slugify }}" class="tag-link">{{ tag }}</a>
 *   {% endfor %}
 */

export interface TagLink {
  /** The display text for the tag (original tag name) */
  text: string;
  /** The href URL: /tags/#slugified-tag-name */
  href: string;
}

export interface RenderedPostTags {
  /** The rendered tag links for the post */
  tagLinks: TagLink[];
}

/**
 * Slugifies a tag name following Jekyll's slugify filter behavior:
 * - Converts to lowercase
 * - Replaces spaces and non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses consecutive hyphens into one
 */
export function slugify(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Renders the tag links for a post.
 * Each tag is converted to a link pointing to `/tags/#slugified-tag`.
 *
 * @param tags - Array of tag strings assigned to the post
 * @returns RenderedPostTags containing the list of tag links
 */
export function renderPostTags(tags: string[]): RenderedPostTags {
  const tagLinks: TagLink[] = tags.map((tag) => ({
    text: tag,
    href: `/tags/#${slugify(tag)}`,
  }));

  return { tagLinks };
}
