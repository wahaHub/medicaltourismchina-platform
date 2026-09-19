import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseGuideMetadata, parseSeoMetadata } from '../src/lib/guide-metadata.mjs';
import { prepareGuideBody } from '../src/lib/guide-markdown.mjs';

// Apply a reviewed locale pack without rewriting clinical sections or references.
// Usage: node scripts/apply-guide-editorial-release.mjs <release-dir> <locale> [--apply]
const [directory, locale, mode] = process.argv.slice(2);
const locales = ['en','zh','es','fr','de','ru','ar','id'];
if (!directory || !locales.includes(locale)) throw Error('Expected release directory and supported locale');
const root = path.resolve(import.meta.dirname, '..');
const release = path.resolve(root, directory);
const input = JSON.parse(fs.readFileSync(path.join(release, `input-${locale}.json`), 'utf8'));
const edits = JSON.parse(fs.readFileSync(path.join(release, `edits-${locale}.json`), 'utf8'));
if (input.length !== 510 || edits.length !== 510) throw Error('Incomplete article coverage');
const inputs = new Map(input.map(row => [row.id, row]));
const ids = new Set();
const titles = new Set();
const china = {en:/\bchina\b/i,zh:/中国|赴华|来华|在华|中华/,es:/\bchina\b|\bchino/i,fr:/\bchine\b|\bchinois/i,de:/china|chinesisch/i,ru:/кита[йеяю]|китайск/i,ar:/الصين|صيني/,id:/\b(?:tiongkok|cina|china)\b/i};
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/[\s*_`]/g, '').toLowerCase();

function editSection(source, heading, fields) {
  const re = new RegExp(`(^## ${heading}[^\\S\\r\\n]*\\r?\\n)([\\s\\S]*?)(?=^#{1,2} |(?![\\s\\S]))`, 'm');
  let matched = false;
  const result = source.replace(re, (_, prefix, body) => {
    matched = true;
    let lines = body.split(/\r?\n/);
    for (const field of fields) {
      const aliases = new Set(field.aliases.map(normalize));
      lines = lines.filter(line => {
        const match = line.trim().replace(/^[-*+]\s+/, '').match(/^([^:：]+)[:：]\s*(.*)$/);
        if (!match || !aliases.has(normalize(match[1]))) return true;
        return false;
      });
      // Metadata is intentionally source-owned; no runtime keyword injection.
      lines.push(`- **${field.label}:** ${field.value}`);
    }
    return `${prefix}\n${lines.join('\n').trim()}\n\n`;
  });
  if (!matched) throw Error(`Missing ${heading} section`);
  return result;
}

const planned = [];
for (const edit of edits) {
  const beforeInput = inputs.get(edit.id);
  if (!beforeInput || beforeInput.key !== edit.key || ids.has(edit.id)) throw Error(`Bad id/key ${edit.id}`);
  ids.add(edit.id);
  for (const field of ['title','h1','description','subtitle']) {
    if (typeof edit[field] !== 'string' || !edit[field].trim() || /[\r\n]/.test(edit[field])) throw Error(`Bad ${field}: ${edit.id}`);
  }
  const key = edit.title.normalize('NFKC').toLowerCase().trim();
  if (titles.has(key)) throw Error(`Duplicate title: ${edit.id}`);
  titles.add(key);
  if (![151,168].includes(edit.id) && (!china[locale].test(edit.title) || !china[locale].test(edit.h1))) throw Error(`Missing China scope: ${edit.id}`);
  if (Boolean(edit.lead) !== Boolean(beforeInput.leadEnglish)) throw Error(`Unexpected body edit: ${edit.id}`);
  if (edit.lead && (typeof edit.lead !== 'string' || /[\r\n]|^#/.test(edit.lead))) throw Error(`Invalid lead: ${edit.id}`);
  if (locale === 'en' && edit.title !== beforeInput.enTitle) throw Error(`Unapproved English title: ${edit.id}`);
  if (locale === 'zh' && edit.title !== beforeInput.zhTitle) throw Error(`Unapproved Chinese title: ${edit.id}`);
  const filename = path.join(root, beforeInput.file);
  const before = fs.readFileSync(filename, 'utf8');
  const metadata = parseGuideMetadata(before);
  const same = metadata.seo.title === edit.title && metadata.hero.title === edit.h1
    && metadata.seo.description === edit.description && metadata.hero.subtitle === edit.subtitle;
  const authored = parseSeoMetadata(before);
  if (same && (!edit.lead || before.includes(`## Content\n\n${edit.lead}\n\n`)) && authored.title && authored.description) continue;
  if (metadata.seo.title !== beforeInput.currentTitle || metadata.hero.title !== beforeInput.currentH1
      || metadata.seo.description !== beforeInput.currentDescription || metadata.hero.subtitle !== beforeInput.currentSubtitle) {
    throw Error(`Source changed since review: ${beforeInput.file}`);
  }
  let after = before.replace(/^# [^\r\n]+/m, `# ${edit.h1}`);
  after = editSection(after, 'Hero', [
    {label:'Title',aliases:['Title','标题'],value:edit.h1},
    {label:'Subtitle',aliases:['Subtitle','副标题'],value:edit.subtitle},
    {label:'Updated date',aliases:['Updated date','更新日期'],value:'2026/09/19'},
  ]);
  after = editSection(after, 'SEO Metadata', [
    {label:'Meta title',aliases:['Meta title','SEO title','Meta标题','SEO标题','标题'],value:edit.title},
    {label:'Meta description',aliases:['Meta description','SEO description','Meta描述','SEO描述','描述'],value:edit.description},
  ]);
  if (edit.lead) after = after.replace(/^## Content[ \t]*\r?\n/m, `## Content\n\n${edit.lead}\n\n`);
  after = after.trimEnd() + "\n";
  const parsed = parseGuideMetadata(after);
  if (parsed.hero.title !== edit.h1 || parsed.hero.subtitle !== edit.subtitle || parsed.seo.title !== edit.title
      || parsed.seo.description !== edit.description || parsed.hero.updatedDate !== '2026/09/19') throw Error(`Round-trip failure: ${edit.id}`);
  const originalBody = prepareGuideBody(before);
  const editedBody = prepareGuideBody(after);
  const restoredBody = edit.lead ? editedBody.replace(`## Content\n\n${edit.lead}\n\n`, '## Content\n') : editedBody;
  const normalizeSpace = text => text.replace(/\r\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
  if (normalizeSpace(restoredBody) !== normalizeSpace(originalBody)) throw Error(`Clinical content changed: ${edit.id}`);
  const links = text => [...text.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]);
  if (JSON.stringify(links(before)) !== JSON.stringify(links(after))) throw Error(`References changed: ${edit.id}`);
  planned.push({id:edit.id,key:edit.key,file:beforeInput.file,beforeSHA256:hash(before),afterSHA256:hash(after),
    titleChanged:metadata.seo.title!==edit.title,h1Changed:metadata.hero.title!==edit.h1,
    descriptionChanged:metadata.seo.description!==edit.description,subtitleChanged:metadata.hero.subtitle!==edit.subtitle,
    leadAdded:Boolean(edit.lead),beforeUpdatedDate:metadata.hero.updatedDate,afterUpdatedDate:'2026/09/19',after});
}
if (mode === '--apply') {
  for (const row of planned) fs.writeFileSync(path.join(root,row.file),row.after);
}
const result = {locale,mode:mode==='--apply'?'applied':'dry-run',reviewed:edits.length,modified:planned.length,
  titles:planned.filter(r=>r.titleChanged).length,h1:planned.filter(r=>r.h1Changed).length,
  descriptions:planned.filter(r=>r.descriptionChanged).length,subtitles:planned.filter(r=>r.subtitleChanged).length,
  leads:planned.filter(r=>r.leadAdded).length,clinicalBodyPreserved:true,linksPreserved:true,
  files:planned.map(({after,...row})=>row)};
fs.writeFileSync(path.join(release,`application-${locale}${mode==='--apply'?'':'-dry-run'}.json`),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,files:undefined}));
