import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { GUIDE_LOCALES } from '../src/lib/guide-locales.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides-manifest.json'), 'utf8'));
const sitemap = new JSDOM(await fs.readFile(path.join(root, 'dist/sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
const indexed = new Set([...sitemap.window.document.querySelectorAll('url > loc')].map(e => e.textContent));
sitemap.window.close();
const origin = 'https://www.medicaltourismchina.health';
const errors = [];
const availableOnly = process.argv.includes('--available');
let checked = 0;
for (const category of manifest.categories) {
  for (const guide of category.guides) {
    const base = `/guides/${category.slug}/${guide.slug}`;
    if (!availableOnly && GUIDE_LOCALES.some(locale => !guide.locales.includes(locale))) errors.push(`${base}: missing native locales`);
    const locales = availableOnly ? guide.locales : GUIDE_LOCALES;
    const alternates = Object.fromEntries(locales.map(locale => [locale === 'zh' ? 'zh-Hans' : locale,
      `${origin}${locale === 'en' ? '' : '/' + locale}${base}`]));
    alternates['x-default'] = origin + base;
    for (const locale of locales) {
      const route = `${locale === 'en' ? '' : '/' + locale}${base}`;
      const url = origin + route;
      const fail = message => errors.push(`${route}: ${message}`);
      let html;
      try { html = await fs.readFile(path.join(root, 'dist', route, 'index.html'), 'utf8'); }
      catch { fail('missing prerendered HTML'); continue; }
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      if (!indexed.has(url)) fail('missing sitemap entry');
      if (doc.querySelector('link[rel="canonical"]')?.getAttribute('href') !== url) fail('incorrect canonical');
      for (const [language, href] of Object.entries(alternates)) {
        if (doc.querySelector(`link[rel="alternate"][hreflang="${language}"]`)?.getAttribute('href') !== href) fail(`incorrect hreflang ${language}`);
      }
      if (doc.querySelectorAll('link[rel="alternate"][hreflang]').length !== Object.keys(alternates).length) fail('unexpected unavailable language alternate');
      const article = doc.querySelector('[data-seo-article-content]');
      if (!article || article.textContent.length < 500) fail('missing full article');
      if (article?.getAttribute('lang') !== (locale === 'zh' ? 'zh-Hans' : locale)) fail('incorrect article language');
      if (article?.getAttribute('dir') !== (locale === 'ar' ? 'rtl' : 'ltr')) fail('incorrect reading direction');
      if (!doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()) fail('missing description');
      if (/noindex/i.test(doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '')) fail('noindex on native article');
      const schema = JSON.parse(doc.querySelector('#page-structured-data')?.textContent || '{}');
      const entity = schema['@graph']?.find(e => e['@type'] === 'Article');
      if (entity?.inLanguage !== (locale === 'zh' ? 'zh-Hans' : locale)) fail('incorrect structured-data language');
      dom.window.close();
      checked++;
    }
  }
}
const report = { checked, expected: manifest.categories.reduce((n, c) => n + c.guides.reduce((total, guide) => total + (availableOnly ? guide.locales.length : GUIDE_LOCALES.length), 0), 0), errors };
await fs.mkdir(path.join(root, 'content-imports/2026-09-10-subagent-translations'), { recursive: true });
await fs.writeFile(path.join(root, 'content-imports/2026-09-10-subagent-translations/seo-asset-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, errors: errors.slice(0, 20) }));
if (errors.length || checked !== report.expected) process.exitCode = 1;
