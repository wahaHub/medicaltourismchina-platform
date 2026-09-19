import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const manifest = JSON.parse(await fs.readFile(new URL('../src/data/guides-manifest.json', import.meta.url)));
const origin = 'https://www.medicaltourismchina.health';
const rows = manifest.categories.flatMap(c => c.guides.map(g => ({...g, category:c.slug})));
const example = rows.find(g => g.locales.length === 8);
const errors = []; const results = [];
async function get(route) {const r=await fetch(origin+route,{signal:AbortSignal.timeout(45000)}); return {r,text:await r.text()};}
const {r:sr,text:xml}=await get('/sitemap.xml');
const sitemap = new JSDOM(xml,{contentType:'text/xml'});
const urls=new Set([...sitemap.window.document.querySelectorAll('url > loc')].map(n=>n.textContent));
const expected=rows.flatMap(g=>g.locales.map(l=>`${origin}${l==='en'?'':'/'+l}/guides/${g.category}/${g.slug}`));
const articleUrls=[...urls].filter(u=>/\/guides\/[^/]+\/[^/]+$/.test(new URL(u).pathname));
if(sr.status!==200||expected.some(u=>!urls.has(u))||articleUrls.length!==expected.length)errors.push('sitemap article coverage mismatch');
sitemap.window.close();
for(const locale of example.locales){
 const route=`${locale==='en'?'':'/'+locale}/guides/${example.category}/${example.slug}`;
 const {r,text}=await get(route); const dom=new JSDOM(text); const d=dom.window.document;
 const article=d.querySelector('[data-seo-article-content]');
 const canonical=d.querySelector('link[rel="canonical"]')?.href;
 const alternates=[...d.querySelectorAll('link[rel="alternate"][hreflang]')];
 const lang=locale==='zh'?'zh-Hans':locale;
 const schema=JSON.parse(d.querySelector('#page-structured-data')?.textContent||'{}');
 const ok=r.status===200&&article?.textContent.length>500&&article?.getAttribute('lang')===lang&&article?.getAttribute('dir')===(locale==='ar'?'rtl':'ltr')&&canonical===origin+route&&alternates.length===9&&schema['@graph']?.some(e=>e['@type']==='Article'&&e.inLanguage===lang)&&!!d.querySelector('meta[name="description"]')?.content;
 if(!ok)errors.push(route); results.push({route,status:r.status,title:d.title,bodyCharacters:article?.textContent.length,alternates:alternates.length,ok}); dom.window.close();
 const directory=`${locale==='en'?'':'/'+locale}/guides`; const dd=await get(directory);
 const expectedLinks=rows.filter(g=>g.locales.includes(locale)).map(g=>`${locale==='en'?'':'/'+locale}/guides/${g.category}/${g.slug}`);
 const dirDom=new JSDOM(dd.text); const links=new Set([...dirDom.window.document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
 if(dd.r.status!==200||expectedLinks.some(u=>!links.has(u)))errors.push(directory+' missing native links');
 results.push({route:directory,status:dd.r.status,nativeLinks:expectedLinks.length});dirDom.window.close();
}
const unavailable=rows.find(g=>!g.locales.includes('ar'));
for(const route of ['/guides/not-a-category/not-a-guide','/ja/guides/'+example.category+'/'+example.slug,...(unavailable?['/ar/guides/'+unavailable.category+'/'+unavailable.slug]:[])]){
 const {r,text}=await get(route);const noindex=/noindex/i.test((r.headers.get('x-robots-tag')||'')+text);if(r.status!==404||!noindex)errors.push(route+' expected 404 noindex');results.push({route,status:r.status,noindex});
}
const raw='/guides/'+example.category+'/'+example.slug+'.md';const rr=await get(raw);if(rr.r.status!==200||!/noindex/i.test(rr.r.headers.get('x-robots-tag')||''))errors.push('raw markdown indexability');
const robots=await get('/robots.txt');if(robots.r.status!==200||!robots.text.includes(origin+'/sitemap.xml'))errors.push('robots sitemap');
const report={at:new Date().toISOString(),sitemapUrls:urls.size,articleUrls:articleUrls.length,translations:articleUrls.length-1020,results,errors};
await fs.mkdir(new URL('../content-imports/2026-09-10-subagent-translations/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../content-imports/2026-09-10-subagent-translations/partial-production-verification.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));if(errors.length)process.exitCode=1;
