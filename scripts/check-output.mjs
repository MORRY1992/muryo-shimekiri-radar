import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const config=JSON.parse(await fs.readFile('data/site.json','utf8'));
const items=JSON.parse(await fs.readFile('data/campaigns.json','utf8'));
const base=(process.env.SITE_URL||config.url).replace(/\/$/,'');
const all=await fs.readdir('dist',{recursive:true}),html=all.filter(x=>x.endsWith('.html'));let links=0;
for(const file of html){
 const s=await fs.readFile(path.join('dist',file),'utf8');
 assert.equal((s.match(/<h1[ >]/g)||[]).length,1,`${file}: one h1`);
 const route=file==='index.html'?'/':file==='404.html'?'/404.html':'/'+file.replace(/index\.html$/,'');
 assert.ok(s.includes(`rel="canonical" href="${base}${route}"`),`${file}: exact canonical`);
 assert.ok(s.includes('property="og:image"'),`${file}: OGP`);
 assert.ok(s.includes('name="google-site-verification" content="EuNEpBZmHEmdZQ6MrhX1X6HME4LkcC5O2_vVCpQmz54"'),`${file}: existing GSC token`);
 assert.ok(!/<script[^>]+src=["']https?:/i.test(s),`${file}: no third party runtime scripts`);
 assert.ok(s.includes('/privacy/')&&s.includes('/contact/'),`${file}: usable footer`);
 for(const m of s.matchAll(/(?:href|src)="(\/[^"#]*)/g)){let url=m[1].split('?')[0];if(url.endsWith('/'))url+='index.html';await fs.access(path.join('dist',url));links++;}
}
const sitemap=await fs.readFile('dist/sitemap.xml','utf8');
for(const c of items){assert.ok(sitemap.includes(`${base}/campaigns/${c.id}/`),`${c.id}: in sitemap`);const detail=await fs.readFile(`dist/campaigns/${c.id}/index.html`,'utf8');assert.ok(detail.includes(`data-detail="${c.id}"`),`${c.id}: detail retained`);assert.ok(detail.includes('3つの期限をチェック'),`${c.id}: separate deadlines`);}
for(const p of ['campaigns.json','site.json'])assert.deepEqual(await fs.readFile(`dist/data/${p}`),await fs.readFile(`data/${p}`),`${p}: exact data bytes`);
const headers=await fs.readFile('dist/_headers','utf8');assert.ok(headers.includes("script-src 'self'"));assert.ok(headers.includes('/data/*\n  Cache-Control: no-cache'));
assert.equal(config.ads.enabled,false,'ad integration requires a separate reviewed release');assert.equal(config.analytics.enabled,false,'no new analytics');
await fs.access('dist/og.png');await fs.access('dist/robots.txt');await fs.access('dist/assets/visuals.mjs');
console.log(JSON.stringify({htmlPages:html.length,campaignPages:items.length,internalLinksChecked:links,missing:0,dataBytesPreserved:true,adsEnabled:false}));
