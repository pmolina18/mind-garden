import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load as loadYaml } from 'js-yaml';

describe('Navigation include (_includes/navigation.html)', () => {
  const navigationHtml = readFileSync(
    resolve(__dirname, '..', '_includes', 'navigation.html'),
    'utf-8'
  );

  it('uses semantic <nav> element with aria-label', () => {
    expect(navigationHtml).toContain('<nav');
    expect(navigationHtml).toMatch(/aria-label=["']Main navigation["']/);
  });

  it('iterates over site.navigation to render links', () => {
    expect(navigationHtml).toContain('{% for link in site.navigation %}');
    expect(navigationHtml).toContain('{{ link.title }}');
    expect(navigationHtml).toContain('{% endfor %}');
  });

  it('uses relative_url filter for navigation links', () => {
    expect(navigationHtml).toContain("link.url | relative_url");
  });

  it('applies active class when page.url matches link URL', () => {
    expect(navigationHtml).toContain('page.url == link.url');
    expect(navigationHtml).toContain('class="active"');
  });

  it('uses aria-current="page" for active link', () => {
    expect(navigationHtml).toContain('aria-current="page"');
  });

  it('includes RSS feed link', () => {
    expect(navigationHtml).toContain("'/feed.xml' | relative_url");
  });

  it('RSS feed link has accessible label', () => {
    expect(navigationHtml).toMatch(/aria-label=["']RSS Feed["']/);
  });

  it('uses a list structure for navigation links', () => {
    expect(navigationHtml).toContain('<ul');
    expect(navigationHtml).toContain('<li>');
    expect(navigationHtml).toContain('</li>');
    expect(navigationHtml).toContain('</ul>');
  });

  describe('Requirement 4.2: Navigation link order (Home, About, Tags, Categories)', () => {
    it('_config.yml defines navigation in fixed order: Home, About, Tags, Categories', () => {
      const configContent = readFileSync(
        resolve(__dirname, '..', '_config.yml'),
        'utf-8'
      );
      const config = loadYaml(configContent) as { navigation: Array<{ title: string; url: string }> };

      expect(config.navigation).toBeDefined();
      expect(config.navigation).toHaveLength(4);
      expect(config.navigation[0].title).toBe('Home');
      expect(config.navigation[1].title).toBe('About');
      expect(config.navigation[2].title).toBe('Tags');
      expect(config.navigation[3].title).toBe('Categories');
    });

    it('template renders links in iteration order from site.navigation (preserving config order)', () => {
      // The template uses {% for link in site.navigation %} which preserves array order
      // This ensures the config order (Home, About, Tags, Categories) is rendered as-is
      expect(navigationHtml).toContain('{% for link in site.navigation %}');
      // There should be no sorting or reordering logic in the template
      expect(navigationHtml).not.toContain('| sort');
    });
  });

  describe('Requirement 4.3: Active page receives distinct styling', () => {
    it('active link has a different class than inactive links', () => {
      // The template conditionally applies class="active" for the matching page
      // and renders without that class for non-matching pages
      const activePattern = /class="active"/;
      const inactivePattern = /<a href="{{ link_url }}">{{ link.title }}<\/a>/;

      expect(navigationHtml).toMatch(activePattern);
      expect(navigationHtml).toMatch(inactivePattern);
    });

    it('only the matching page link gets the active class (conditional logic)', () => {
      // Verify the template uses an if/else to differentiate active vs inactive
      expect(navigationHtml).toContain('{% if page.url == link.url %}');
      expect(navigationHtml).toContain('{% else %}');
      expect(navigationHtml).toContain('{% endif %}');
    });
  });

  describe('Requirement 8.3: RSS feed link in navigation', () => {
    it('RSS feed link points to /feed.xml using relative_url filter', () => {
      expect(navigationHtml).toContain("'/feed.xml' | relative_url");
    });

    it('RSS feed link is rendered within the navigation list', () => {
      // The RSS link should be inside the nav <ul> as a list item
      const navStart = navigationHtml.indexOf('<ul');
      const navEnd = navigationHtml.indexOf('</ul>');
      const feedLinkPos = navigationHtml.indexOf("'/feed.xml' | relative_url");

      expect(feedLinkPos).toBeGreaterThan(navStart);
      expect(feedLinkPos).toBeLessThan(navEnd);
    });

    it('RSS feed link contains an SVG icon or visible indicator', () => {
      // The RSS link should have visual content (SVG icon)
      expect(navigationHtml).toContain('<svg');
      expect(navigationHtml).toContain('</svg>');
    });
  });
});
