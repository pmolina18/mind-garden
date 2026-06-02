# Implementation Plan: Mind Garden Personal Blog

## Overview

This plan implements a Jekyll-based personal blog ("Mind Garden") deployed to GitHub Pages via GitHub Actions. The site uses Liquid templates, a minimalist CSS theme, tag/category taxonomy pages, and an RSS/Atom feed. Property-based tests are written in TypeScript using fast-check and Vitest.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Create `_config.yml` with site identity, URL, plugins, and navigation
    - Define `title`, `description`, `url` (`https://pmolina18.github.io`), `baseurl` (`/mind-garden`)
    - Set `permalink: /:year/:month/:day/:title/`
    - Configure `markdown: kramdown` with `input: GFM`
    - Add plugins: `jekyll-feed`, `jekyll-seo-tag`
    - Add `feed.posts_limit: 20`
    - Define `navigation` array: Home, About, Tags, Categories
    - _Requirements: 1.1, 7.1, 7.4_

  - [x] 1.2 Create `Gemfile` for Jekyll dependencies
    - Add `jekyll`, `jekyll-feed`, `jekyll-seo-tag` gems
    - _Requirements: 7.4_

  - [x] 1.3 Create directory structure (`_posts/`, `_layouts/`, `_includes/`, `assets/css/`)
    - Create empty `_posts/` directory with a `.gitkeep` file
    - Create `_layouts/`, `_includes/`, and `assets/css/` directories
    - _Requirements: 1.2, 1.5_

  - [x] 1.4 Set up TypeScript testing framework with Vitest and fast-check
    - Create `package.json` with `vitest`, `fast-check`, and `typescript` dev dependencies
    - Create `tsconfig.json` for the test project
    - Create `vitest.config.ts`
    - Create `tests/` directory for property-based and unit tests
    - _Requirements: (testing infrastructure)_

- [x] 2. Implement layouts and includes
  - [x] 2.1 Create `_includes/head.html`
    - Add meta charset, viewport meta tag
    - Add `{% seo %}` tag for SEO metadata
    - Add `{% feed_meta %}` tag for RSS autodiscovery link
    - Link to `/assets/css/style.css`
    - _Requirements: 8.4, 5.1_

  - [x] 2.2 Create `_includes/navigation.html`
    - Iterate over `site.navigation` to render links
    - Apply `active` class when `page.url` matches link URL
    - Include RSS feed link/icon
    - Ensure keyboard accessibility with visible focus indicators
    - Use semantic `<nav>` element with `aria-label`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.3_

  - [x] 2.3 Create `_includes/footer.html`
    - Add site footer with copyright/attribution
    - _Requirements: 5.4_

  - [x] 2.4 Create `_layouts/default.html`
    - HTML5 doctype, `<html lang="en">`
    - Include `head.html` in `<head>`
    - Include `navigation.html` in `<body>`
    - Render `{{ content }}` in a `<main>` element
    - Include `footer.html`
    - _Requirements: 1.5, 4.1_

  - [x] 2.5 Create `_layouts/post.html`
    - Extend `default.html` layout
    - Display post title as `<h1>`
    - Display publication date in human-readable format
    - Render tags as clickable links to `/tags/#tag-name`
    - Display categories if present
    - Render post content
    - _Requirements: 2.2, 3.3_

- [x] 3. Implement pages and content
  - [x] 3.1 Create `index.md` (Home page)
    - Set layout to `default`, title to "Home"
    - List the 10 most recent posts in reverse chronological order
    - Each entry shows title (as link) and formatted date
    - _Requirements: 1.3_

  - [x] 3.2 Create `about.md` (About page)
    - Set layout to `default`, title to "About", permalink to `/about/`
    - Add placeholder author information content
    - _Requirements: 1.4_

  - [x] 3.3 Create `tags.md` (Tags listing page)
    - Set layout to `default`, title to "Tags", permalink to `/tags/`
    - List all tags alphabetically with post count
    - Under each tag heading, list associated posts in reverse chronological order
    - Use `id` attribute on headings for anchor linking (`#tag-name`)
    - Exclude tags with zero posts
    - _Requirements: 3.1, 3.2, 3.6_

  - [x] 3.4 Create `categories.md` (Categories listing page)
    - Set layout to `default`, title to "Categories", permalink to `/categories/`
    - Same structure as tags.md but iterating over `site.categories`
    - Exclude categories with zero posts
    - _Requirements: 3.4, 3.5, 3.6_

  - [x] 3.5 Create a sample post in `_posts/`
    - Use correct naming convention: `YYYY-MM-DD-welcome-to-mind-garden.md`
    - Include valid front matter: `layout`, `title`, `date`, `tags`, `categories`
    - Write sample GFM content (headings, code block, list)
    - _Requirements: 1.6, 2.1, 2.2, 2.4_

- [x] 4. Checkpoint - Verify site structure and local build
  - Ensure all files are in place and the Jekyll site can be built locally without errors, ask the user if questions arise.

- [x] 5. Implement minimalist CSS theme
  - [x] 5.1 Create `assets/css/style.css`
    - Define color palette: max 3 primary colors + neutrals (white, black, grey)
    - All text/background combinations meet WCAG 2.1 AA (≥ 4.5:1 contrast)
    - System font stack (sans-serif), 16px+ base font size
    - Line height 1.5–1.6, max content width 70ch
    - Flexbox-based responsive layout (320px–1920px without horizontal scrollbars)
    - No decorative box-shadows, background patterns, or borders on content areas
    - Touch targets minimum 44×44px on mobile (< 768px)
    - Navigation responsive behavior (inline or CSS toggle for < 768px)
    - Visible focus indicators for keyboard navigation
    - Active navigation link distinct styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 4.3, 4.4, 4.5_

- [x] 6. Implement GitHub Actions deployment workflow
  - [x] 6.1 Create `.github/workflows/deploy.yml`
    - Trigger on push to `main` branch
    - Set permissions: `contents: read`, `pages: write`, `id-token: write`
    - Set concurrency group `"pages"` with `cancel-in-progress: true`
    - Build job: checkout, configure-pages, jekyll-build-pages, upload-pages-artifact
    - Deploy job: deploy-pages action with environment output URL
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 7. Checkpoint - Verify complete site build and deployment config
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement property-based tests
  - [x] 8.1 Write property test for home page post selection (Property 1)
    - **Property 1: Home page shows the 10 most recent posts in reverse chronological order**
    - Generate random post collections (varying sizes and dates)
    - Verify logic selects at most 10 posts, ordered newest to oldest
    - **Validates: Requirements 1.3**

  - [x] 8.2 Write property test for tag count validation (Property 2)
    - **Property 2: Tag count validation**
    - Generate random tag lists (lengths 0–15)
    - Verify validation accepts 1–10 tags and rejects 0 or >10
    - **Validates: Requirements 2.4**

  - [x] 8.3 Write property test for required front matter exclusion (Property 3)
    - **Property 3: Required front matter exclusion**
    - Generate post front matter with random field presence/absence
    - Verify posts missing `title`, `date`, or `layout` are excluded
    - **Validates: Requirements 2.5**

  - [x] 8.4 Write property test for date format validation (Property 4)
    - **Property 4: Date format validation**
    - Generate random date strings (valid ISO 8601 and invalid formats)
    - Verify acceptance of valid dates and rejection of invalid ones
    - **Validates: Requirements 2.6**

  - [x] 8.5 Write property test for taxonomy listing correctness (Property 5)
    - **Property 5: Taxonomy listing correctness**
    - Generate random post collections with tags/categories
    - Verify alphabetical ordering (case-insensitive) and accurate post counts
    - **Validates: Requirements 3.1, 3.4**

  - [x] 8.6 Write property test for taxonomy filtered view correctness (Property 6)
    - **Property 6: Taxonomy filtered view correctness**
    - Generate post collections and pick random tag/category
    - Verify filtered results are exactly correct and sorted reverse chronologically
    - **Validates: Requirements 3.2, 3.5**

  - [x] 8.7 Write property test for post tag rendering (Property 7)
    - **Property 7: Post tag rendering**
    - Generate posts with random tag sets (1–10 tags)
    - Verify all tags are present and link to correct tag filtered view
    - **Validates: Requirements 3.3**

  - [x] 8.8 Write property test for empty taxonomy exclusion (Property 8)
    - **Property 8: Empty taxonomy exclusion**
    - Generate post collections where some tags/categories have zero posts after filtering
    - Verify those terms are excluded from listing
    - **Validates: Requirements 3.6**

  - [x] 8.9 Write property test for feed listing correctness (Property 10)
    - **Property 10: Feed listing correctness**
    - Generate large post collections (20+ posts)
    - Verify feed contains exactly top 20 by date, ordered newest to oldest
    - **Validates: Requirements 8.2**

- [x] 9. Implement unit and integration tests
  - [x] 9.1 Write unit tests for configuration validation
    - Verify `_config.yml` contains required keys: `title`, `url`, `baseurl`, `plugins`, `permalink`
    - Verify plugins list includes `jekyll-feed` and `jekyll-seo-tag`
    - _Requirements: 1.1, 7.1, 7.4_

  - [x] 9.2 Write unit tests for workflow structure
    - Verify `deploy.yml` has correct triggers (`push` to `main`)
    - Verify permissions, concurrency settings, and action references
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x] 9.3 Write unit tests for navigation rendering logic
    - Verify navigation renders links in fixed order: Home, About, Tags, Categories
    - Verify active page receives distinct styling class
    - Verify RSS feed link is present
    - _Requirements: 4.1, 4.2, 4.3, 8.3_

  - [x] 9.4 Write integration test for Jekyll build
    - Verify a valid site structure builds without errors
    - Verify sample post renders to HTML with correct content
    - _Requirements: 1.6, 2.1, 2.2_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The core site implementation (tasks 1–7) uses Jekyll/Liquid/YAML/CSS
- The test suite (tasks 8–9) uses TypeScript with Vitest and fast-check
- All internal links must use the `relative_url` Liquid filter to respect `baseurl`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "6.1"] },
    { "id": 2, "tasks": ["2.4", "2.5"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4"] }
  ]
}
```
