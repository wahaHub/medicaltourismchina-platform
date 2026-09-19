import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { parseGuideMetadata, parseSeoMetadata } from '../src/lib/guide-metadata.mjs';
import { extractHtmlSeo, parseSitemap } from '../seo/artifact-validation.mjs';

const root = path.resolve(import.meta.dirname, '..');
const release = path.resolve(root, process.argv[2] || 'docs/seo/2026-09-19-china-editorial-release');
const locales = ['en','zh','es','fr','de','ru','ar','id'];
const origin = 'https://www.medicaltourismchina.health';
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const decode = s => s.replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const xml = fs.readFileSync(path.join(root,'dist/sitemap.xml'),'utf8');
const entries = parseSitemap(xml);
const lastmods = new Map([...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([,body])=>[body.match(/<loc>(.*?)<\/loc>/)?.[1],body.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]]));
const urls = new Map(entries.map(e=>[e.loc,e]));
const reports = [];
const comparison = [];
for (const locale of locales) {
  const input = read(path.join(release,`input-${locale}.json`));
  const edits = read(path.join(release,`edits-${locale}.json`));
  const applied = read(path.join(release,`application-${locale}.json`));
  assert.equal(edits.length,510);
  for (const file of applied.files) {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.file))).digest('hex');
    assert.equal(digest,file.afterSHA256,`Post-application source changed: ${file.file}`);
  }
  for (const edit of edits) {
    const prior = input.find(x=>x.id===edit.id);
    const source = fs.readFileSync(path.join(root,prior.file),'utf8');
    const metadata = parseGuideMetadata(source);
    const authored = parseSeoMetadata(source);
    assert.equal(authored.title,edit.title,`${locale}/${edit.key}: source title`);
    assert.equal(authored.description,edit.description,`${locale}/${edit.key}: source description`);
    assert.equal(metadata.hero.title,edit.h1);
    const route = `${locale==='en'?'':`/${locale}`}/guides/${edit.key}`;
    const html = fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
    const seo = extractHtmlSeo(html);
    assert.equal(decode(seo.title),edit.title,`${route}: title`);
    assert.equal(decode(seo.h1),edit.h1,`${route}: H1`);
    assert.equal(decode(seo.description),edit.description,`${route}: description`);
    assert.equal(seo.counts.h1,1,`${route}: unique H1`);
    assert.equal(seo.canonical,origin+route);
    assert.ok(urls.has(origin+route),`${route}: sitemap`);
    assert.equal(Object.keys(seo.alternates).length,9,`${route}: hreflang`);
    const jsonld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    const article = jsonld.flatMap(x=>x['@graph']||[x]).find(x=>x['@type']==='Article');
    assert.ok(article,`${route}: Article schema`);
    assert.equal(article.headline,edit.h1);
    assert.equal(article.description,edit.description);
    assert.equal(article.dateModified,metadata.hero.updatedDate.replaceAll('/','-'));
    assert.equal(lastmods.get(origin+route),article.dateModified);
    for(const name of ['og:title','twitter:title']) {
      const tag = [...html.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]).find(t=>t.includes(`="${name}"`));
      assert.equal(decode(tag?.match(/content="([^"]*)"/)?.[1]||''),edit.title,`${route}: ${name}`);
    }
    comparison.push({id:edit.id,locale,url:origin+route,beforeTitle:prior.currentTitle,afterTitle:edit.title,beforeH1:prior.currentH1,afterH1:edit.h1,beforeDescription:prior.currentDescription,afterDescription:edit.description,lead:edit.lead});
  }
  reports.push(Object.fromEntries(Object.entries(applied).filter(([k])=>k!=='files')));
}
assert.equal(entries.length,11910);
assert.equal(entries.filter(e=>/\/guides\/[^/]+\/[^/]+$/.test(new URL(e.loc).pathname)).length,4080);
for(const locale of locales) assert.ok(urls.has(`${origin}${locale==='en'?'':`/${locale}`}/telemedicine`));
const report = {verifiedAt:new Date().toISOString(),articles:510,articlePages:4080,sitemapUrls:entries.length,telemedicineLocales:8,locales:reports,checks:['source metadata','rendered title/H1/description','OG/Twitter title','canonical','nine hreflang alternates','Article headline/description/dateModified','sitemap membership and per-locale lastmod','preserved clinical body and reference links in application reports']};
fs.writeFileSync(path.join(release,'validation.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(release,'published-comparison.json'),JSON.stringify(comparison,null,2)+'\n');
const htmlPath=path.join(release,'index.html');
if(fs.existsSync(htmlPath)){
 const serialized=JSON.stringify(comparison).replaceAll('<','\\u003c');
 fs.writeFileSync(htmlPath,fs.readFileSync(htmlPath,'utf8').replace(/(<script id="comparison-data" type="application\/json">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+serialized+b));
}
console.log(JSON.stringify(report,null,2));
