import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

describe('Configuration validation (_config.yml)', () => {
  const configPath = resolve(__dirname, '..', '_config.yml');
  const configContent = readFileSync(configPath, 'utf-8');
  const config = yaml.load(configContent) as Record<string, unknown>;

  it('contains required key: title', () => {
    expect(config).toHaveProperty('title');
    expect(config.title).toBeTruthy();
  });

  it('contains required key: url', () => {
    expect(config).toHaveProperty('url');
    expect(config.url).toBeTruthy();
  });

  it('contains required key: baseurl', () => {
    expect(config).toHaveProperty('baseurl');
    expect(config.baseurl).toBe('/mind-garden');
  });

  it('contains required key: plugins', () => {
    expect(config).toHaveProperty('plugins');
    expect(Array.isArray(config.plugins)).toBe(true);
  });

  it('contains required key: permalink', () => {
    expect(config).toHaveProperty('permalink');
    expect(config.permalink).toBeTruthy();
  });

  it('plugins list includes jekyll-feed', () => {
    const plugins = config.plugins as string[];
    expect(plugins).toContain('jekyll-feed');
  });

  it('plugins list includes jekyll-seo-tag', () => {
    const plugins = config.plugins as string[];
    expect(plugins).toContain('jekyll-seo-tag');
  });

  it('url is set to the correct GitHub Pages URL', () => {
    expect(config.url).toBe('https://pmolina18.github.io');
  });
});
