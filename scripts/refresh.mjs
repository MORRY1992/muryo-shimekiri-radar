// Reconcile expiry/staleness without fetching unapproved external sources.
// Optional observations JSON: [{id,at,ok,hash,reason}]. Fetches never certify terms.
import fs from 'node:fs/promises';
import {statusOf,applyObservation,validateCampaigns} from '../src/core.mjs';
export function reconcile(items,observations=[],now=new Date()){
 const ids=new Set(items.map(c=>c.id));for(const o of observations){if(!ids.has(o.id)||!o.at||!Number.isFinite(Date.parse(o.at))||typeof o.ok!=='boolean')throw Error('invalid observation');}
 const updated=items.map(original=>{let c=structuredClone(original);for(const o of observations.filter(o=>o.id===c.id))c=applyObservation(c,o);
 const s=statusOf(c,now);
 if(s==='ended'&&c.verificationStatus!=='ended'){c.verificationStatus='ended';c.history.push({at:new Date(now).toISOString(),kind:'expired',note:'記録済みの応募期限を経過。終了履歴へ移動。'});}
 if(s==='pending'&&c.verificationStatus==='verified'){c.verificationStatus='pending';c.reviewReason='確認期限の経過、または締切時刻未公表のため再確認待ち';c.history.push({at:new Date(now).toISOString(),kind:'review-required',note:c.reviewReason});}
 return c;});validateCampaigns(updated);return updated;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const file='data/campaigns.json',before=JSON.parse(await fs.readFile(file,'utf8'));
 const observations=process.argv[2]?JSON.parse(await fs.readFile(process.argv[2],'utf8')):[];
 const after=reconcile(before,observations);await fs.writeFile(file+'.tmp',JSON.stringify(after,null,2)+'\n');await fs.rename(file+'.tmp',file);
 console.log(JSON.stringify({campaigns:after.length,changed:after.filter((c,i)=>JSON.stringify(c)!==JSON.stringify(before[i])).length,externalRequests:0}));
}
