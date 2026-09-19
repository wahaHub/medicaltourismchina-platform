import fs from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const prior=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
const current=JSON.parse(await fs.readFile(new URL('../src/data/guides-manifest.json',import.meta.url),'utf8'));
const old=new Map(prior.categories.flatMap(c=>c.guides.map(g=>[c.slug+'/'+g.slug,g.locales])));
const rows=current.categories.flatMap(c=>c.guides.map(g=>({...g,key:c.slug+'/'+g.slug})));
const samples=[];const errors=[];
for(const locale of ['es','fr','de','ru','ar','id']){
 const g=rows.find(g=>g.locales.includes(locale)&&!old.get(g.key)?.includes(locale));if(!g)continue;
 const url='https://www.medicaltourismchina.health/'+locale+'/guides/'+g.key;
 const r=await fetch(url,{signal:AbortSignal.timeout(45000)});const d=new JSDOM(await r.text());const doc=d.window.document;
 const a=doc.querySelector('[data-seo-article-content]');const ok=r.status===200&&a?.getAttribute('lang')===locale&&a.textContent.length>500&&doc.querySelector('link[rel="canonical"]')?.href===url;
 samples.push({locale,url,status:r.status,title:doc.title,bodyCharacters:a?.textContent.length,ok});if(!ok)errors.push(url);d.window.close();
}
const added=rows.reduce((n,g)=>n+g.locales.filter(l=>!old.get(g.key)?.includes(l)).length,0);
const report={checkedAt:new Date().toISOString(),added,samples,errors};
await fs.mkdir(new URL('../content-imports/2026-09-10-subagent-translations/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../content-imports/2026-09-10-subagent-translations/new-translations-production.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length)process.exitCode=1;
