import test from 'node:test';
import assert from 'node:assert/strict';
import {card,calendar,deadlineLabel} from '../src/render.mjs';
import {selectCampaigns,statusOf} from '../src/core.mjs';
import fs from 'node:fs/promises';
const data=JSON.parse(await fs.readFile(new URL('../data/campaigns.json',import.meta.url),'utf8'));
const now='2026-11-03T12:00:00+09:00';
const c={...structuredClone(data[0]),id:'presentation',title:'長いタイトル & <script>危険</script>'.repeat(15),benefit:'特典の説明'.repeat(100),verificationStatus:'verified',lastVerifiedAt:'2026-11-03T10:00:00+09:00',startAt:null,startDate:null,endAt:'2026-11-04T12:00:00+09:00',endDate:null,purchaseDeadline:'2026-11-03T19:00:00+09:00',redemptionDeadline:'2026-11-10T23:59:00+09:00',history:[]};
test('long titles and benefits are retained and escaped; separate deadlines and save labels remain',()=>{
 const html=card(c,now,true);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes(c.benefit));
 assert.ok(html.includes('<dt>購入</dt>'));assert.ok(html.includes('<dt>引換・受取</dt>'));assert.ok(html.includes('11/10'));assert.ok(html.includes('aria-pressed="true"'));
 assert.ok(html.includes('明日が応募締切'));assert.ok(html.includes('公式条件確認済み'));
});
test('expiry and exactly 48 hours show explicit text and do not present stale as verified',()=>{
 assert.equal(statusOf(c,'2026-11-04T12:00:00+09:00'),'ended');assert.equal(deadlineLabel(c,'2026-11-04T12:00:00+09:00'),'応募終了');
 const stale={...c,endAt:'2026-11-20T12:00:00+09:00'};
 const html=card(stale,'2026-11-05T10:00:00+09:00');assert.ok(html.includes('再確認待ち'));assert.ok(html.includes('受付状況は公式で要確認'));assert.ok(!html.includes('公式条件確認済み'));
});
test('calendar covers seven JST dates and distinguishes pending from ended and upcoming',()=>{
 const pending={...c,id:'pending',verificationStatus:'pending'},ended={...c,id:'ended',verificationStatus:'ended'},upcoming={...c,id:'upcoming',startAt:'2026-11-04T11:00:00+09:00'};
 const html=calendar([c,pending,ended,upcoming],now,'2026-11-04');
 assert.equal((html.match(/data-day=/g)||[]).length,7);assert.ok(html.includes('data-day="2026-11-03"'));assert.ok(html.includes('data-day="2026-11-09"'));
 assert.ok(html.includes('11月4日 2件、うち再確認待ち1件'));assert.ok(html.includes('要確認あり'));assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 const boundary=calendar([], '2026-11-03T15:01:00Z');assert.ok(boundary.includes('data-day="2026-11-04"'));
});
test('calendar exact-day filter and combined conditions keep unknown values out',()=>{
 const next={...c,id:'next',endAt:'2026-11-05T12:00:00+09:00'},unknown={...c,id:'unknown',registrationRequired:null};
 assert.deepEqual(selectCampaigns([c,next,unknown],{exactDay:'2026-11-04',registration:'no'},now).map(x=>x.id),c.registrationRequired===false?['presentation']:[]);
 assert.deepEqual(selectCampaigns([c,next],{exactDay:'2026-11-04'},now).map(x=>x.id),['presentation']);
});
