export const STATUS = {verified:'公式条件確認済み',pending:'再確認待ち',ended:'応募終了',upcoming:'開始前'};
export const AWARD = {lottery:'抽選',first:'先着',all:'条件達成で全員'};
export function dayJst(value = new Date()) {return new Date(new Date(value).getTime()+32400000).toISOString().slice(0,10);}
export function statusOf(c, now = new Date()) {
 const t=+new Date(now), day=dayJst(now);
 if(c.verificationStatus==='ended'||(c.endAt&&t>=Date.parse(c.endAt))||(c.endDate&&day>c.endDate)) return 'ended';
 if(c.verificationStatus!=='verified'||!c.lastVerifiedAt||t-Date.parse(c.lastVerifiedAt)>=172800000||Date.parse(c.lastVerifiedAt)>t+300000) return 'pending';
 if((c.startAt&&t<Date.parse(c.startAt))||(c.startDate&&day<c.startDate)) return 'upcoming';
 if(!c.endAt&&(!c.endDate||day===c.endDate)) return 'pending';
 return 'verified';
}
export function deadlineDay(c){return c.endAt?dayJst(c.endAt):c.endDate;}
export function selectCampaigns(items, f={}, now=new Date()) {
 const today=dayJst(now), tomorrow=dayJst(+new Date(now)+86400000), weekEnd=dayJst(+new Date(now)+(7-(new Date(today+'T00:00:00Z').getUTCDay()||7))*86400000);
 const matchesBool=(v,s)=>!s||s==='any'||(s==='yes'?v===true:v===false);
 let list=items.filter(c=>{
  const status=statusOf(c,now),d=deadlineDay(c);
  if(f.status!=='all'&&status!==(f.status||'verified'))return false;
  if(f.q&&!`${c.title} ${c.organizer} ${c.benefit} ${c.category}`.toLocaleLowerCase().includes(f.q.trim().toLocaleLowerCase()))return false;
  if(f.deadline==='today'&&d!==today||f.deadline==='tomorrow'&&d!==tomorrow||f.deadline==='week'&&(!d||d<today||d>weekEnd))return false;
  if(f.endDate&&(!d||d>f.endDate))return false;
  if(!matchesBool(c.purchaseRequired,f.purchase)||!matchesBool(c.registrationRequired,f.registration))return false;
  if(f.award&&c.awardType!==f.award||f.category&&c.category!==f.category||f.channel&&c.channel!==f.channel)return false;
  if(f.region&&!c.region?.includes(f.region)&&!c.region?.includes('全国'))return false;
  if(f.daily&&!c.daily)return false;
  if(f.redeem&&c.awardType!=='first'&&!c.redemptionDeadline&&!c.redemptionDate)return false;
  if(f.saved&&!f.savedIds?.includes(c.id))return false;
  return true;
 });
 const key=c=>c.endAt?Date.parse(c.endAt):c.endDate?Date.parse(c.endDate+'T00:00:00+09:00'):Infinity;
 return list.sort((a,b)=>f.sort==='newest'?Date.parse(b.history?.[0]?.at||b.lastVerifiedAt)-Date.parse(a.history?.[0]?.at||a.lastVerifiedAt):key(a)-key(b)||a.title.localeCompare(b.title,'ja'));
}
export function canonicalSource(url){const u=new URL(url);u.hash='';for(const k of [...u.searchParams.keys()])if(k.startsWith('utm_'))u.searchParams.delete(k);return u.href.replace(/\/$/,'');}
export function validateCampaigns(items){
 if(!Array.isArray(items))throw Error('campaigns must be array');const ids=new Set(),urls=new Set();
 for(const c of items){
  for(const k of ['id','title','organizer','category','benefit','officialUrl','lastVerifiedAt','verificationStatus'])if(!c[k])throw Error(`${c.id}: missing ${k}`);
  if(!/^[a-z0-9-]+$/.test(c.id))throw Error('invalid id');
  if(!Object.hasOwn(STATUS,c.verificationStatus))throw Error('invalid status');
  if(!Object.hasOwn(AWARD,c.awardType))throw Error('invalid award');
  for(const k of ['purchaseRequired','registrationRequired'])if(![true,false,null].includes(c[k]))throw Error(`invalid ${k}`);
  for(const url of [c.officialUrl,...(c.sourceUrls||[])])if(new URL(url).protocol!=='https:')throw Error('https required');
  const u=canonicalSource(c.officialUrl);if(ids.has(c.id)||urls.has(u))throw Error('duplicate id or URL');ids.add(c.id);urls.add(u);
  for(const k of ['startAt','endAt','purchaseDeadline','redemptionDeadline','lastVerifiedAt'])if(c[k]&&(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(c[k])||!Number.isFinite(Date.parse(c[k]))))throw Error(`${c.id}: timezone required ${k}`);
  for(const k of ['startAt','endAt','purchaseDeadline','redemptionDeadline','lastVerifiedAt'])if(c[k]&&new Date(c[k].slice(0,10)).toISOString().slice(0,10)!==c[k].slice(0,10))throw Error('invalid calendar date');
  for(const k of ['startDate','endDate','purchaseDate','redemptionDate'])if(c[k]&&(!/^\d{4}-\d{2}-\d{2}$/.test(c[k])||new Date(c[k]).toISOString().slice(0,10)!==c[k]))throw Error(`invalid date ${k}`);
  if(c.startAt&&c.endAt&&Date.parse(c.startAt)>=Date.parse(c.endAt))throw Error('start after end');
  if(!Array.isArray(c.history)||!Array.isArray(c.region)||!c.sourceUrls?.length)throw Error('missing history/region/sources');
 }
 return true;
}
export function applyObservation(c,o){
 const next=structuredClone(c);next.lastAttemptAt=o.at;
 if(!o.ok){next.verificationStatus='pending';next.reviewReason=o.reason||'情報源を取得できませんでした';next.history.push({at:o.at,kind:'fetch-failed',note:next.reviewReason});}
 else if(o.hash&&o.hash!==c.sourceHash){next.verificationStatus='pending';next.reviewReason='情報源の変更を検知。条件を再確認します';next.sourceHash=o.hash;next.history.push({at:o.at,kind:'source-changed',note:next.reviewReason});}
 return next;
}
export function dateText(at,date){if(at)return new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(at));return date?`${Number(date.slice(5,7))}/${Number(date.slice(8,10))}（時刻未公表）`:'未確認・記載なし';}
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
