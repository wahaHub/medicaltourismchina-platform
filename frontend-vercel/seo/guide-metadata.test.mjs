// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGuideMetadata, parseHero, parseSeoMetadata, makeExcerpt, mergeLocalizedText } from '../src/lib/guide-metadata.mjs';

const root = fileURLToPath(new URL('../public/guides/', import.meta.url));

describe('guide metadata', () => {
  it.each(['Meta title', 'SEO title', 'Meta 标题', 'Meta标题', 'SEO 标题'])('reads %s with either bold delimiter and colon', (label) => {
    for (const colon of [':', '：']) {
      for (const line of [`- **${label}${colon}** Authored title`, `* **${label}**${colon} Authored title`, `${label}${colon} Authored title`]) {
        expect(parseSeoMetadata(`## SEO Metadata\r\n${line}\r\n## Content\r\n- **Meta title:** Wrong`).title).toBe('Authored title');
      }
    }
  });
  it.each(['Meta description', 'Meta 描述', 'Meta描述', 'SEO 描述'])('preserves the complete authored %s', (label) => {
    const description = 'A carefully qualified description. '.repeat(12);
    expect(parseGuideMetadata(`## SEO Metadata\n- **${label}:** ${description}`).seo.description).toBe(description.trim());
  });
  it('reads Chinese Hero labels without changing the authored title', () => {
    const hero = parseHero('# 001 Draft\n## Hero\n- **标题：** 真正标题\n- **副标题**：真正描述\n- **栏目：** 指南\n- **子栏目：** 治疗\n- **更新日期：** 2026/09/09\n- **审阅：** 作者');
    expect(hero).toEqual({ title: '真正标题', subtitle: '真正描述', category: '指南', subcategory: '治疗', updatedDate: '2026/09/09', reviewedBy: '作者' });
    expect(parseHero('# 5 questions to ask').title).toBe('5 questions to ask');
    expect(parseHero('# 2026 treatment questions').title).toBe('2026 treatment questions');
    expect(parseHero('# 001 Authored title').title).toBe('Authored title');
  });
  it('derives missing SEO from patient prose through EOF and preserves qualifications', () => {
    const source = '# Title\n## Hero\n- **Subtitle:** Teaser\n## Content\n### Patient section\nRead the [records](https://example.com) with your **team**.[S1] This does not guarantee eligibility.';
    expect(parseGuideMetadata(source).seo).toEqual({ title: 'Title', description: 'Read the records with your team. This does not guarantee eligibility.' });
    const long = `${'Clinical context '.repeat(25)}does not guarantee eligibility.`;
    expect(makeExcerpt(`## Content\n${long}`)).toBe(long);
    expect(makeExcerpt('## Content\n这是患者正文。[1] 下一句。')).toBe('这是患者正文。 下一句。');
  });
  it('skips editorial, SEO, references, code and headings when deriving prose', () => {
    expect(makeExcerpt('## Hero\n- **Title:** Title\n## Content\n### A heading\n```md\nFake facts\n```\n## Patient details\nPatient-authored explanation.\n## SEO Metadata\n- **Primary keyword:** keywords')).toBe('Patient-authored explanation.');
    expect(makeExcerpt('## Content\n## Sources\nReference claim', 'Authored subtitle')).toBe('Authored subtitle');
    expect(parseGuideMetadata('# Title\n## SEO Metadata\n- **Primary keyword:** cure').seo.description).toBe('');
  });
  it('extends short openings with whole source paragraphs without cutting qualifiers', () => {
    const opening = 'Risk groups differ.';
    const next = 'Your care team reviews the results. This does not guarantee eligibility.';
    expect(makeExcerpt(`## Content\n${opening}\n\n${next}\n\nLater paragraph.`)).toBe(`${opening} ${next}`);
    const qualified = 'This opening sentence already exceeds forty characters. However, treatment may not be appropriate.';
    expect(makeExcerpt(`## Content\n${qualified}`)).toBe(qualified);
    const chinese = '“需要住多久？”没有统一答案。检查与治疗安排取决于个人情况，医生需要先审阅资料，不能保证固定时间。';
    expect(makeExcerpt(`## Content\n${chinese}`)).toBe(chinese);
    expect(makeExcerpt('## Content\nShort.\n## Sources\nReference text cannot pad the description.')).toBe('Short.');
  });
  it('preserves authored SEO even when it is shorter than the validator minimum', () => {
    expect(parseGuideMetadata('## SEO Metadata\n- **Meta description:** Authored short text.\n## Content\nA longer body paragraph that exceeds forty characters.').seo.description).toBe('Authored short text.');
  });
  it('only detects source availability from patient prose, not metadata-only stubs', () => {
    expect(makeExcerpt('# Titre\n## Hero\n- **Title:** Titre\n- **Subtitle:** Description\n## SEO Metadata\n- **Meta description:** Description')).toBe('');
    expect(makeExcerpt('# Titre\n## Content\nTexte rédigé pour les patients.')).toBe('Texte rédigé pour les patients.');
  });
  it('never replaces real translated source strings with title-only dictionaries', () => {
    const actual = { en: 'Original', zh: '原文', fr: 'Titre réel', es: '' };
    expect(mergeLocalizedText(actual, { zh: '旧标题', fr: 'Old title', es: 'Título', ar: 'عنوان' })).toEqual({ ...actual, es: 'Título', ar: 'عنوان' });
    expect(actual.es).toBe('');
    expect(mergeLocalizedText({ zh: '正文描述' }, { zh: '旧描述' }).zh).toBe('正文描述');
  });
  it('covers all 17 imported conditions in six locales while preserving source labels', () => {
    const labels = JSON.parse(fs.readFileSync(new URL('../src/data/guide-condition-translations.json', import.meta.url), 'utf8'));
    const inventory = JSON.parse(fs.readFileSync(new URL('../content-imports/2026-09-09-new-305/inventory.json', import.meta.url), 'utf8'));
    const ids = [...new Set(inventory.articles.map((article) => article.conditionId))].sort();
    expect(Object.keys(labels).sort()).toEqual(ids);
    expect(ids).toHaveLength(17);
    for (const id of ids) {
      expect(Object.keys(labels[id]).sort()).toEqual(['ar', 'de', 'es', 'fr', 'id', 'ru']);
      for (const label of Object.values(labels[id])) {
        expect(typeof label).toBe('string');
        expect(label.trim()).toBe(label);
        expect(label.length).toBeGreaterThan(0);
        expect(label.length).toBeLessThan(100);
      }
    }
    for (const article of inventory.articles) {
      const before = { ...article.condition };
      const merged = mergeLocalizedText(article.condition, labels[article.conditionId]);
      expect(merged.en).toBe(before.en);
      expect(merged.zh).toBe(before.zh);
      expect(Object.keys(merged)).toHaveLength(8);
      expect(article.condition).toEqual(before);
    }
  });
  it('retains authored SEO titles and descriptions for every imported article translation', () => {
    const inventory = JSON.parse(fs.readFileSync(new URL('../content-imports/2026-09-09-new-305/inventory.json', import.meta.url), 'utf8'));
    const missing = [];
    for (const article of inventory.articles) {
      for (const locale of ['en','zh','es','fr','de','ru','ar','id']) {
        const file = path.join(root, article.category, `${article.slug}${locale === 'en' ? '' : '.' + locale}.md`);
        const metadata = parseSeoMetadata(fs.readFileSync(file, 'utf8'));
        if (!metadata.title || !metadata.description) missing.push(`${article.slug}:${locale}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('parses every published source without writing manifests or documents', () => {
    let count = 0;
    for (const category of fs.readdirSync(root, { withFileTypes: true })) {
      if (!category.isDirectory() || category.name.startsWith('_')) continue;
      for (const file of fs.readdirSync(path.join(root, category.name))) {
        if (!file.endsWith('.md')) continue;
        const source = fs.readFileSync(path.join(root, category.name, file), 'utf8');
        const metadata = parseGuideMetadata(source);
        expect(metadata.hero.title, file).toBeTruthy();
        expect(metadata.seo.title, file).toBeTruthy();
        expect(metadata.seo.description, file).toBeTruthy();
        const authored = parseSeoMetadata(source);
        if (authored.title) expect(metadata.seo.title, file).toBe(authored.title);
        if (authored.description) expect(metadata.seo.description, file).toBe(authored.description);
        if (!authored.description) expect(metadata.seo.description.length, `${file}: derived description`).toBeGreaterThanOrEqual(40);
        count++;
      }
    }
    expect(count).toBeGreaterThanOrEqual(1020);
  });
});
