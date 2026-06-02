# Requirements Document

## Introduction

Mind Garden is a personal blog for publishing thoughts on diverse topics without a rigid thematic structure. It is built with Jekyll, written in Markdown, styled with a clean minimalist design, and deployed to GitHub Pages via GitHub Actions. The blog lives at `https://pmolina18.github.io/mind-garden` and is organized through tags and categories rather than a strict hierarchy.

## Glossary

- **Blog**: The Jekyll-based static site that constitutes the Mind Garden personal blog.
- **Post**: A Markdown file in the `_posts` directory following Jekyll naming conventions (`YYYY-MM-DD-title.md`).
- **Page**: A standalone Markdown or HTML file (e.g., About, Archive) not part of the chronological post stream.
- **Tag**: A free-form label assigned to a Post via front matter to enable cross-topic discovery.
- **Category**: A broader grouping assigned to a Post via front matter for high-level classification.
- **Front_Matter**: The YAML block at the top of each Markdown file that defines metadata (title, date, tags, categories, layout).
- **Jekyll**: The static site generator used to build the Blog from Markdown source files.
- **GitHub_Actions_Workflow**: A YAML-defined CI/CD pipeline in `.github/workflows/` that builds and deploys the Blog.
- **GitHub_Pages**: The GitHub hosting service that serves the built Blog at a public URL.
- **Navigation**: The site-wide menu that provides links to key Pages and tag/category listings.
- **Theme**: The Jekyll theme providing the visual design and layout templates for the Blog.

## Requirements

### Requirement 1: Jekyll Site Structure

**User Story:** As a blog author, I want a well-organized Jekyll project structure, so that I can easily add and manage content.

#### Acceptance Criteria

1. THE Blog SHALL contain a `_config.yml` file at the repository root defining site title, description, base URL, theme, and plugin settings.
2. THE Blog SHALL contain a `_posts` directory for storing Post files.
3. THE Blog SHALL contain an `index.md` (or `index.html`) file serving as the home page that lists the 10 most recent Posts in reverse chronological order.
4. THE Blog SHALL contain an `about.md` Page accessible from Navigation providing author information.
5. THE Blog SHALL contain a `_layouts` directory with at least a `default.html` and a `post.html` layout template.
6. WHEN a new Post file is added to the `_posts` directory following the `YYYY-MM-DD-title.md` naming convention, THE Blog SHALL render that Post as an individual HTML page accessible via its permalink and listed on the home page upon the next build.
7. IF a file in the `_posts` directory does not follow the `YYYY-MM-DD-title.md` naming convention, THEN THE Blog SHALL exclude that file from the generated site.

### Requirement 2: Markdown Posts with Front Matter

**User Story:** As a blog author, I want to write posts in Markdown with structured metadata, so that I can focus on content while Jekyll handles presentation.

#### Acceptance Criteria

1. THE Blog SHALL support Posts written entirely in Markdown with GitHub Flavored Markdown extensions.
2. WHEN a Post file contains valid Front_Matter with `title`, `date`, `tags`, and `layout` fields, THE Jekyll build SHALL render the Post using the specified layout, displaying the title and the date on the page, and associating the Post with the specified tags.
3. THE Blog SHALL support an optional `categories` field in Post Front_Matter for broad topic classification.
4. THE Blog SHALL support a `tags` field in Post Front_Matter accepting a YAML list of 1 to 10 Tag values.
5. IF a Post file is missing required Front_Matter fields (`title`, `date`, `layout`), THEN THE Jekyll build SHALL exclude the Post from the generated site.
6. THE Blog SHALL require the `date` field in Front_Matter to follow the `YYYY-MM-DD` format (ISO 8601 date).

### Requirement 3: Tag-Based Organization

**User Story:** As a blog reader, I want to browse posts by topic using tags, so that I can find related content across the blog without a rigid category hierarchy.

#### Acceptance Criteria

1. THE Blog SHALL generate a Tags Page listing all Tags used across Posts in alphabetical order, each displaying the Tag name, the number of associated Posts, and a link to the corresponding Tag filtered view.
2. WHEN a reader selects a Tag on the Tags Page, THE Blog SHALL display all Posts associated with that Tag in reverse chronological order, showing at minimum each Post's title and publication date as links to the full Post.
3. WHEN a Post is rendered, THE Blog SHALL display the Tags assigned to that Post as clickable links leading to the corresponding Tag filtered view.
4. THE Blog SHALL generate a Categories Page listing all Categories used across Posts in alphabetical order, each displaying the Category name, the number of associated Posts, and a link to the corresponding Category filtered view.
5. WHEN a reader selects a Category on the Categories Page, THE Blog SHALL display all Posts associated with that Category in reverse chronological order, showing at minimum each Post's title and publication date as links to the full Post.
6. IF no Posts are associated with a given Tag or Category, THEN THE Blog SHALL omit that Tag or Category from the respective listing page.

### Requirement 4: Navigation

**User Story:** As a blog reader, I want a consistent navigation menu, so that I can easily move between the home page, about page, and topic listings.

#### Acceptance Criteria

1. THE Navigation SHALL be present on every Page and Post of the Blog.
2. THE Navigation SHALL contain links to the Home page, About page, Tags Page, and Categories Page, displayed in that fixed order.
3. THE Navigation SHALL visually differentiate the currently active page link from inactive links by applying a distinct style (such as bold weight, underline, or contrasting color) that is not used on the inactive links.
4. THE Navigation SHALL be accessible via keyboard navigation (all links reachable via Tab key) and meet WCAG 2.1 Level A requirements for minimum contrast ratio (4.5:1 for normal text, 3:1 for large text) and visible focus indicators on all interactive elements.
5. WHILE the viewport width is less than 768px, THE Navigation SHALL remain fully accessible, displaying all links either inline or via a toggle mechanism that reveals all navigation links within a single interaction.

### Requirement 5: Minimalist Theme and Design

**User Story:** As a blog author, I want a clean minimalist design, so that the focus remains on the written content.

#### Acceptance Criteria

1. THE Theme SHALL use a color palette of no more than three primary colors plus white, black, and grey neutral tones, with all text-to-background color combinations meeting a WCAG 2.1 Level AA contrast ratio of at least 4.5:1 for body text.
2. THE Theme SHALL use sans-serif or serif typography with a base font size of at least 16px, a line height between 1.4 and 1.8, and a maximum content line length of 80 characters.
3. THE Theme SHALL provide responsive layouts that display without horizontal scrollbars, without overlapping text or elements, and without requiring horizontal panning on viewports from 320px to 1920px width.
4. THE Theme SHALL not apply decorative box shadows, background patterns, or borders to content areas, limiting such treatments to navigation and footer regions only.
5. THE Blog SHALL load no external font files, or at most one external font family via a single network request, and the total page weight for any page SHALL not exceed 500 KB on initial load (excluding browser cache).
6. THE Theme SHALL maintain a minimum touch-target size of 44×44 CSS pixels for all interactive elements when rendered on viewports below 768px width.

### Requirement 6: GitHub Actions Deployment Workflow

**User Story:** As a blog author, I want automated deployment via GitHub Actions, so that pushing to the main branch publishes the blog without manual steps.

#### Acceptance Criteria

1. THE GitHub_Actions_Workflow SHALL be defined in `.github/workflows/deploy.yml`.
2. WHEN a push event occurs on the `main` branch, THE GitHub_Actions_Workflow SHALL trigger a build and deployment of the Blog to GitHub_Pages.
3. THE GitHub_Actions_Workflow SHALL use the `actions/jekyll-build-pages` action (or equivalent official action) to build the Jekyll site.
4. THE GitHub_Actions_Workflow SHALL use the `actions/deploy-pages` action to deploy the built site to GitHub_Pages.
5. THE GitHub_Actions_Workflow SHALL set appropriate permissions (`pages: write`, `id-token: write`) for deployment.
6. IF the Jekyll build step fails, THEN THE GitHub_Actions_Workflow SHALL mark the workflow run as failed in the GitHub Actions interface and SHALL NOT execute the deployment step.
7. IF the deployment step fails, THEN THE GitHub_Actions_Workflow SHALL mark the workflow run as failed in the GitHub Actions interface, leaving the previously deployed version of the Blog intact on GitHub_Pages.
8. WHILE a deployment triggered by the GitHub_Actions_Workflow is in progress, THE GitHub_Actions_Workflow SHALL cancel any previously queued or in-progress deployment runs for the same branch to prevent overlapping deployments.

### Requirement 7: GitHub Repository and Pages Configuration

**User Story:** As a blog author, I want the repository properly configured for GitHub Pages, so that the blog is served at the correct URL.

#### Acceptance Criteria

1. THE Blog `_config.yml` SHALL set `baseurl` to `/mind-garden` and `url` to `https://pmolina18.github.io`.
2. THE GitHub_Pages configuration SHALL use "GitHub Actions" as the build and deployment source (not the legacy branch-based deployment).
3. WHEN the GitHub_Actions_Workflow deployment completes successfully, THE Blog SHALL respond with an HTTP 200 status and render the home page content at `https://pmolina18.github.io/mind-garden` within 5 minutes of deployment completion.
4. THE `_config.yml` SHALL list `jekyll-seo-tag` and `jekyll-feed` in the `plugins` configuration key for SEO metadata and RSS feed generation.
5. IF the Blog does not respond with HTTP 200 at `https://pmolina18.github.io/mind-garden` within 5 minutes of a successful deployment, THEN THE GitHub_Pages configuration SHALL be considered misconfigured.

### Requirement 8: RSS Feed

**User Story:** As a blog reader, I want an RSS feed, so that I can subscribe to the blog and receive updates in my feed reader.

#### Acceptance Criteria

1. THE Blog SHALL generate a valid Atom XML feed at `/mind-garden/feed.xml` that conforms to the Atom 1.0 specification (RFC 4287) and is parseable by standard feed readers.
2. WHEN a new Post is published, THE feed SHALL include that Post as an entry containing at minimum the Post title, permalink URL, publication date, and content summary or full content, upon the next build. THE feed SHALL contain at most the 20 most recent Posts ordered by publication date descending.
3. THE Navigation SHALL include a link or icon pointing to the RSS feed URL.
4. THE Blog SHALL include an HTML `<link>` autodiscovery element with `rel="alternate"` and `type="application/atom+xml"` in the `<head>` of every Page and Post, pointing to the feed URL.
