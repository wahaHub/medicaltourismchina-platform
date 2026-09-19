import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { extractHtmlSeo, parseSitemap, isXmlContentType } from '../seo/artifact-validation.mjs';
const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'docs/seo/2026-09-19-china-editorial-release');
const origin='https://www.medicaltourismchina.health';
const locales=['en','zh','es','fr','de','ru','ar','id'];
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(45000)});assert.equal(r.status,200,url);return r;}
const sitemapResponse=await get(origin+'/sitemap.xml');assert.ok(isXmlContentType(sitemapResponse.headers.get('content-type')));
const xml=await sitemapResponse.text();const entries=parseSitemap(xml);const urls=new Map(entries.map(e=>[e.loc,e]));
assert.equal(entries.length,11910);assert.equal(entries.filter(e=>/\/guides\/[^/]+\/[^/]+$/.test(new URL(e.loc).pathname)).length,4080);
const lastmods=new Map([...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([,body])=>[body.match(/<loc>(.*?)<\/loc>/)?.[1],body.match(/<lastmod>(.*?)<\/lastmod>/)?.[1]]));
const robots=await(await get(origin+'/robots.txt')).text();assert.ok(robots.includes('Sitemap: '+origin+'/sitemap.xml'));
const samples=[];
for(const locale of locales){
 const prefix=locale==='en'?'':`/${locale}`;
 assert.ok(urls.has(origin+prefix+'/telemedicine'));
 const rows=JSON.parse(fs.readFileSync(path.join(dir,`edits-${locale}.json`)));
 await Promise.all(rows.filter(r=>[18,33,489,495].includes(r.id)).map(async row=>{
  const url=`${origin}${prefix}/guides/${row.key}`;
  const response=await get(url);const html=await response.text();const seo=extractHtmlSeo(html);
  assert.equal(decode(seo.title),row.title,url+' title');assert.equal(decode(seo.h1),row.h1,url+' H1');assert.equal(decode(seo.description),row.description,url+' description');assert.equal(seo.canonical,url);assert.equal(seo.counts.h1,1);assert.equal(Object.keys(seo.alternates).length,9);assert.ok(!seo.robots.includes('noindex'));
  const ld=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return j['@graph']||[j]});const article=ld.find(x=>x['@type']==='Article');assert.equal(article.headline,row.h1);assert.equal(article.dateModified,'2026-09-19');assert.equal(lastmods.get(url),article.dateModified);
  if(row.lead)assert.ok(decode(html).includes(row.lead),url+' lead');
  samples.push({url,title:row.title,dateModified:article.dateModified});
 }));
 const tel=extractHtmlSeo(await(await get(origin+prefix+'/telemedicine')).text());assert.ok(!tel.robots.includes('noindex'));assert.equal(tel.canonical,origin+prefix+'/telemedicine');
}
const report={verifiedAt:new Date().toISOString(),sitemapUrls:entries.length,articleUrls:4080,articleSamples:samples.length,telemedicineLocales:8,robotsSitemap:true,pass:true,samples:samples.sort((a,b)=>a.url.localeCompare(b.url))};
fs.writeFileSync(path.join(dir,'production-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,samples:undefined},null,2));
