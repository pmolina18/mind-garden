/**
 * Home page post selection logic.
 *
 * Given an array of posts (each with a date), selects the top 10
 * most recent posts in descending chronological order (newest first).
 */

export interface Post {
  title: string;
  date: Date;
}

/**
 * Selects at most 10 posts from the given array, ordered by date
 * descending (most recent first). This mirrors the Jekyll/Liquid logic:
 *   {% assign recent_posts = site.posts | slice: 0, 10 %}
 * where site.posts is already sorted newest-first by Jekyll.
 */
export function selectHomePagePosts(posts: Post[]): Post[] {
  return [...posts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);
}
