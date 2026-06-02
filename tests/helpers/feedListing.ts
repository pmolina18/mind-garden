/**
 * Feed listing logic.
 *
 * Given an array of posts (each with a date), selects the top 20
 * most recent posts in descending chronological order (newest first).
 * If fewer than 20 posts exist, all posts are included.
 *
 * This mirrors the jekyll-feed plugin behavior configured with:
 *   feed.posts_limit: 20
 */

export interface FeedPost {
  title: string;
  date: Date;
}

/**
 * Selects at most 20 posts from the given array, ordered by date
 * descending (most recent first). This mirrors the jekyll-feed plugin
 * behavior which limits feed entries to `feed.posts_limit` (20) and
 * orders them newest to oldest.
 */
export function selectFeedPosts(posts: FeedPost[]): FeedPost[] {
  return [...posts]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);
}
