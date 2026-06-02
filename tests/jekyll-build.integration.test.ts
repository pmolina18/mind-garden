import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { load as parseYaml } from 'js-yaml';

const ROOT = resolve(__dirname, '..');

/**
 * Helper: parse YAML front matter from a Markdown/HTML file.
 * Returns the parsed object or null if no front matter found.
 */
function parseFrontMatter(filePath: string): Record<string, unknown> | null {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return parseYaml(match[1]) as Record<string, unknown>;
}

/**
 * Helper: extract {% include ... %} references from a file's content.
 */
function extractIncludes(content: string): string[] {
  const regex = /\{%[-\s]*include\s+([\w./\-]+)/g;
  const includes: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    includes.push(match[1]);
  }
  return includes;
}

describe('Integration: Jekyll build structure validation', () => {
  describe('Directory structure completeness', () => {
    it('has _config.yml at root', () => {
      expect(existsSync(join(ROOT, '_config.yml'))).toBe(true);
    });

    it('has _posts directory', () => {
      expect(existsSync(join(ROOT, '_posts'))).toBe(true);
    });

    it('has _layouts directory with default.html and post.html', () => {
      expect(existsSync(join(ROOT, '_layouts', 'default.html'))).toBe(true);
      expect(existsSync(join(ROOT, '_layouts', 'post.html'))).toBe(true);
    });

    it('has _includes directory', () => {
      expect(existsSync(join(ROOT, '_includes'))).toBe(true);
    });

    it('has assets/css/style.css', () => {
      expect(existsSync(join(ROOT, 'assets', 'css', 'style.css'))).toBe(true);
    });

    it('has index.md home page', () => {
      expect(existsSync(join(ROOT, 'index.md'))).toBe(true);
    });

    it('has about.md page', () => {
      expect(existsSync(join(ROOT, 'about.md'))).toBe(true);
    });

    it('has tags.md page', () => {
      expect(existsSync(join(ROOT, 'tags.md'))).toBe(true);
    });

    it('has categories.md page', () => {
      expect(existsSync(join(ROOT, 'categories.md'))).toBe(true);
    });

    it('has .github/workflows/deploy.yml', () => {
      expect(existsSync(join(ROOT, '.github', 'workflows', 'deploy.yml'))).toBe(true);
    });
  });

  describe('_config.yml has valid YAML structure', () => {
    let config: Record<string, unknown>;

    it('parses as valid YAML', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('contains required site identity fields', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(config.title).toBeDefined();
      expect(config.url).toBeDefined();
      expect(config.baseurl).toBeDefined();
    });

    it('has correct baseurl and url for GitHub Pages', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(config.baseurl).toBe('/mind-garden');
      expect(config.url).toBe('https://pmolina18.github.io');
    });

    it('has plugins configured with jekyll-feed and jekyll-seo-tag', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(Array.isArray(config.plugins)).toBe(true);
      expect(config.plugins).toContain('jekyll-feed');
      expect(config.plugins).toContain('jekyll-seo-tag');
    });

    it('has permalink structure defined', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(config.permalink).toBeDefined();
    });

    it('has markdown processor configured', () => {
      const content = readFileSync(join(ROOT, '_config.yml'), 'utf-8');
      config = parseYaml(content) as Record<string, unknown>;
      expect(config.markdown).toBeDefined();
    });
  });

  describe('All referenced layouts exist', () => {
    it('post.html layout references default layout which exists', () => {
      const postLayoutFm = parseFrontMatter(join(ROOT, '_layouts', 'post.html'));
      expect(postLayoutFm).not.toBeNull();
      expect(postLayoutFm!.layout).toBe('default');
      expect(existsSync(join(ROOT, '_layouts', 'default.html'))).toBe(true);
    });

    it('all pages reference layouts that exist in _layouts/', () => {
      const pages = ['index.md', 'about.md', 'tags.md', 'categories.md'];
      for (const page of pages) {
        const fm = parseFrontMatter(join(ROOT, page));
        expect(fm).not.toBeNull();
        const layout = fm!.layout as string;
        expect(layout).toBeDefined();
        expect(
          existsSync(join(ROOT, '_layouts', `${layout}.html`))
        ).toBe(true);
      }
    });

    it('sample post references a layout that exists', () => {
      const postsDir = join(ROOT, '_posts');
      const posts = readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');
      expect(posts.length).toBeGreaterThan(0);

      for (const post of posts) {
        const fm = parseFrontMatter(join(postsDir, post));
        if (fm && fm.layout) {
          expect(
            existsSync(join(ROOT, '_layouts', `${fm.layout}.html`))
          ).toBe(true);
        }
      }
    });
  });

  describe('All referenced includes exist', () => {
    it('default.html includes all reference existing files in _includes/', () => {
      const content = readFileSync(join(ROOT, '_layouts', 'default.html'), 'utf-8');
      const includes = extractIncludes(content);
      expect(includes.length).toBeGreaterThan(0);

      for (const inc of includes) {
        expect(
          existsSync(join(ROOT, '_includes', inc))
        ).toBe(true);
      }
    });

    it('all layout files reference only existing includes', () => {
      const layoutsDir = join(ROOT, '_layouts');
      const layouts = readdirSync(layoutsDir).filter(f => f.endsWith('.html'));

      for (const layout of layouts) {
        const content = readFileSync(join(layoutsDir, layout), 'utf-8');
        const includes = extractIncludes(content);
        for (const inc of includes) {
          expect(
            existsSync(join(ROOT, '_includes', inc))
          ).toBe(true);
        }
      }
    });
  });

  describe('Sample post has valid front matter', () => {
    const postsDir = join(ROOT, '_posts');
    const posts = readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');

    it('at least one post exists in _posts/', () => {
      expect(posts.length).toBeGreaterThan(0);
    });

    it('sample post has required front matter fields: layout, title, date, tags', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      expect(fm).not.toBeNull();
      expect(fm!.layout).toBeDefined();
      expect(fm!.title).toBeDefined();
      expect(fm!.date).toBeDefined();
      expect(fm!.tags).toBeDefined();
    });

    it('sample post layout field references an existing layout', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      expect(
        existsSync(join(ROOT, '_layouts', `${fm!.layout}.html`))
      ).toBe(true);
    });

    it('sample post title is a non-empty string', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      expect(typeof fm!.title).toBe('string');
      expect((fm!.title as string).length).toBeGreaterThan(0);
    });

    it('sample post date is a valid YYYY-MM-DD date', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      // YAML may parse date as Date object or string
      const dateVal = fm!.date;
      if (dateVal instanceof Date) {
        expect(dateVal.toString()).not.toBe('Invalid Date');
      } else {
        const dateStr = String(dateVal);
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('sample post tags is a non-empty array with 1-10 items', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      expect(Array.isArray(fm!.tags)).toBe(true);
      const tags = fm!.tags as string[];
      expect(tags.length).toBeGreaterThanOrEqual(1);
      expect(tags.length).toBeLessThanOrEqual(10);
    });

    it('sample post categories (if present) is an array', () => {
      const fm = parseFrontMatter(join(postsDir, posts[0]));
      if (fm!.categories !== undefined) {
        expect(Array.isArray(fm!.categories)).toBe(true);
      }
    });

    it('sample post filename follows YYYY-MM-DD-title.md convention', () => {
      for (const post of posts) {
        expect(post).toMatch(/^\d{4}-\d{2}-\d{2}-.+\.md$/);
      }
    });

    it('sample post has Markdown content after front matter', () => {
      const content = readFileSync(join(postsDir, posts[0]), 'utf-8');
      const afterFrontMatter = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
      expect(afterFrontMatter.trim().length).toBeGreaterThan(0);
    });
  });
});
