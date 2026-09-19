import { stripGuideEditorialSections } from './guide-markdown.mjs';

const HERO_KEYS = {
  title: 'title', 标题: 'title', subtitle: 'subtitle', 副标题: 'subtitle',
  category: 'category', 分类: 'category', 栏目: 'category',
  subcategory: 'subcategory', 子分类: 'subcategory', 子栏目: 'subcategory',
  updateddate: 'updatedDate', 更新日期: 'updatedDate',
  reviewedby: 'reviewedBy', 审核: 'reviewedBy', 审阅: 'reviewedBy',
};
const SEO_KEYS = {
  metatitle: 'title', seotitle: 'title', meta标题: 'title', seo标题: 'title', 标题: 'title',
  metadescription: 'description', seodescription: 'description',
  meta描述: 'description', seo描述: 'description', 描述: 'description',
};
const normalize = (value) => value.replace(/[\s*_`]/g, '').toLowerCase();

function sections(markdown) {
  const result = [];
  let section = { heading: '', lines: [] };
  let fence = '';
  for (const line of stripGuideEditorialSections(String(markdown ?? '')).replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = '';
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^\s{0,3}#{1,2}\s+(.+?)(?:\s+#+)?\s*$/);
    if (heading) {
      result.push(section);
      section = { heading: heading[1], lines: [] };
    } else section.lines.push(line);
  }
  result.push(section);
  return result;
}

function fields(section, aliases) {
  const result = {};
  for (const line of section.lines) {
    const match = line.trim().replace(/^[-*+]\s+/, '').match(/^([^:：]+)[:：]\s*(.*)$/);
    if (!match) continue;
    const key = aliases[normalize(match[1])];
    // Accept both **Label:** value and **Label**: value, retaining authored text.
    const value = match[2].replace(/^\*\*\s*/, '').trim().replace(/^`([^`]+)`$/, '$1');
    if (key && value && !result[key]) result[key] = value;
  }
  return result;
}

export function parseHero(markdown) {
  const hero = { title: '', subtitle: '', category: '', subcategory: '', updatedDate: '', reviewedBy: '' };
  for (const section of sections(markdown)) {
    if (/^(hero|首屏|头部信息)$/i.test(section.heading)) Object.assign(hero, fields(section, HERO_KEYS));
  }
  if (!hero.title) {
    const h1 = String(markdown ?? '').match(/^#\s+(.+?)\s*#*\s*$/m);
    // Only the explicit three-digit editorial index is removed, never title numbers.
    if (h1) hero.title = h1[1].replace(/^\d{3}\s+(?=\S)/, '').trim();
  }
  return hero;
}

export function parseSeoMetadata(markdown) {
  const seo = { title: '', description: '' };
  for (const section of sections(markdown)) {
    if (/^(seo\s*(metadata|元数据|信息)|搜索引擎元数据)$/i.test(section.heading)) Object.assign(seo, fields(section, SEO_KEYS));
  }
  return seo;
}

function plainText(value) {
  return value.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[(?:S?\d+(?:[,–-]\d+)*|\^\w+)\]/g, '')
    .replace(/<[^>]*>/g, '').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}

export function makeExcerpt(markdown, fallback = '') {
  const all = sections(markdown);
  const content = all.findIndex(({ heading }) => /^(content|正文)$/i.test(heading));
  const candidates = content >= 0 ? all.slice(content) : all;
  const paragraphs = [];
  for (const section of candidates) {
    if (/^(hero|首屏|seo\b|sources|references|参考资料|related\b|相关|faq|常见问题)/i.test(section.heading)) {
      if (content >= 0) break;
      continue;
    }
    for (const paragraph of section.lines.join('\n').split(/\n\s*\n/)) {
      const prose = paragraph.split('\n').filter((line) => !/^\s*(?:#|[-*+]\s|\d+[.)]\s|\||>|\[.+\]:)/.test(line)).join(' ');
      const text = plainText(prose);
      if (!text) continue;
      // Keep whole source paragraphs, including later qualifications and quoted
      // questions. Add subsequent prose when the opening paragraph is shorter
      // than the SEO validator's minimum; never pad with invented claims.
      paragraphs.push(text);
      const excerpt = paragraphs.join(' ');
      if (excerpt.length >= 40) return excerpt;
    }
  }
  return paragraphs.join(' ') || plainText(fallback);
}

export function parseGuideMetadata(markdown) {
  const hero = parseHero(markdown);
  const authoredSeo = parseSeoMetadata(markdown);
  const excerpt = makeExcerpt(markdown, hero.subtitle);
  return {
    hero,
    seo: { title: authoredSeo.title || hero.title, description: authoredSeo.description || excerpt },
    excerpt,
  };
}

// Title-only translation dictionaries are fallbacks, not translated source files.
export function mergeLocalizedText(base, translated) {
  const merged = { ...base };
  if (!translated || typeof translated !== 'object') return merged;
  for (const [locale, value] of Object.entries(translated)) {
    if (!merged[locale]?.trim() && typeof value === 'string' && value.trim()) merged[locale] = value;
  }
  return merged;
}
