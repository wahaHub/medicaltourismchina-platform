import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const contract = JSON.parse(await fs.readFile(path.join(root, 'seo/contracts/protected-urls.json'), 'utf8'));
const published = contract.urls.flatMap(url => {
  const match = new URL(url).pathname.match(/^\/(?:(zh|es|fr|de|ru|ar|id)\/)?guides\/([^/]+)\/([^/]+)$/);
  return match ? [{ locale: match[1] || 'en', category: match[2], slug: match[3] }] : [];
});

describe('previously published guide coverage', () => {
  it.each(['en', 'zh', 'es', 'fr', 'de', 'ru', 'ar', 'id'])('retains at least 510 protected %s articles', locale => {
    expect(published.filter(page => page.locale === locale).length).toBeGreaterThanOrEqual(510);
  });

  it('retains a native nonempty source for every protected article URL', async () => {
    const missing = [];
    for (const page of published) {
      const filename = `${page.slug}${page.locale === 'en' ? '' : '.' + page.locale}.md`;
      const source = path.join('public/guides', page.category, filename);
      try {
        if (!(await fs.readFile(path.join(root, source), 'utf8')).trim()) missing.push(source);
      } catch {
        missing.push(source);
      }
    }
    expect(missing).toEqual([]);
  });
});
