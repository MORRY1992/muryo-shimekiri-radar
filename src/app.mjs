import {selectCampaigns,statusOf,STATUS,dayJst,dateText,esc,deadlineDay} from './core.mjs';
import {card} from './render.mjs';
const $=s=>document.querySelector(s);let items=[],saved=[],previousVisit=null,view='all',sort='deadline';
try {const raw=JSON.parse(localStorage.getItem('radar.saved')||'[]');saved=Array.isArray(raw)?raw.filter(x=>typeof x==='string'):[];previousVisit=localStorage.getItem('radar.visit');}catch{}
const toast=message=>{const el=$('#toast');el.textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.textContent='',3500);};
function saveStorage(){try{localStorage.setItem('radar.saved',JSON.stringify(saved));return true;}catch{toast('この環境では保存できません。今回の画面内でのみ保持します。');return false;}}
function filters(){const f=$('#filter-form')?Object.fromEntries(new FormData($('#filter-form'))):{};f.sort=sort;
 const presets={today:{deadline:'today',status:'all'},tomorrow:{deadline:'tomorrow',status:'all'},free:{purchase:'no'},'no-register':{registration:'no'},first:{redeem:true},lottery:{award:'lottery'},daily:{daily:true},week:{deadline:'week'},saved:{saved:true,savedIds:saved,status:'all'},pending:{status:'pending'},ended:{status:'ended'},new:{}};
 return {...f,...presets[view]};
}
function render(){const now=new Date();
 if($('#results')){
  const f=filters();let list=selectCampaigns(items,f,now);
  if(view==='today'||view==='tomorrow')list=list.filter(c=>statusOf(c,now)!=='ended'&&statusOf(c,now)!=='upcoming');
  $('#results').innerHTML=list.length?list.map(c=>card(c,now,saved.includes(c.id),Boolean(previousVisit&&c.history.some(h=>Date.parse(h.at)>Date.parse(previousVisit))))).join(''):'<div class="empty"><h3>この条件の案件はまだありません</h3><p>確認できた公式情報だけを掲載しています。<br>条件を変えて、ほかのチャンスを探してみましょう。</p><button type="button" data-reset>すべての案件を見る</button></div>';
  $('#result-count').textContent=`${list.length}件`;
  const title={today:'今日締切のキャンペーン',tomorrow:'明日締切のキャンペーン',free:'購入不要で応募できる', 'no-register':'会員登録不要',first:'無料引換・先着特典',lottery:'抽選キャンペーン',daily:'毎日応募できる企画',week:'今週終了予定',saved:'保存した案件',pending:'再確認待ち',ended:'終了した案件',new:'新着キャンペーン'};
  $('#list-title').textContent=title[view]||'キャンペーンを探す';
  const note=$('#view-note');note.hidden=!['today','tomorrow','pending','saved','ended'].includes(view);
  note.textContent=view==='ended'?'応募は終了しています。引換期限が残る場合は詳細をご確認ください。':view==='saved'?'このブラウザーに保存した案件です。応募完了や通知の設定ではありません。終了・再確認待ちも含みます。':view==='pending'?'期限・条件の不足、取得失敗、確認から48時間経過などの理由で、現在利用できると断定していません。':'締切時刻が未公表の案件や確認待ちも含みます。受付状況は公式サイトでご確認ください。';
  document.querySelectorAll('.shortcut').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  const today=dayJst(now),tomorrow=dayJst(+now+86400000);
  for(const [key,value] of Object.entries({today:items.filter(c=>deadlineDay(c)===today&&statusOf(c,now)!=='ended').length,tomorrow:items.filter(c=>deadlineDay(c)===tomorrow&&statusOf(c,now)!=='ended').length,free:selectCampaigns(items,{purchase:'no'},now).length,verified:selectCampaigns(items,{},now).length}))$(`[data-count="${key}"]`).textContent=value;
  $('#today-date').textContent=`${now.toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit'})}`;
  const changed=previousVisit&&Number.isFinite(Date.parse(previousVisit))?items.filter(c=>c.history.some(h=>Date.parse(h.at)>Date.parse(previousVisit))).length:null;
  $('#freshness').textContent=changed===null?'最終確認から48時間以内の情報を優先':`前回訪問から追加・変更 ${changed}件`;
 }
 const detail=$('[data-detail]');if(detail){const c=items.find(x=>x.id===detail.dataset.detail);if(c){const status=statusOf(c,now);$('#detail-status').textContent=`${STATUS[status]}｜${status==='verified'?'確認時点の公式条件です。先着終了や変更がないか、応募前に公式サイトをご確認ください。':status==='ended'?'応募期限を過ぎています。引換期限は下記で別にご確認ください。':c.reviewReason||'条件・期限の不足、締切時刻未公表、または確認情報の更新待ちです。現在の受付状況は公式でご確認ください。'}`;}}
 document.querySelectorAll('[data-save]').forEach(b=>{const yes=saved.includes(b.dataset.save);b.setAttribute('aria-pressed',String(yes));b.textContent=yes?'★':'☆';});
}
function reset(){view='all';$('#filter-form')?.reset();sort='deadline';if($('#sort'))$('#sort').value=sort;render();}
document.addEventListener('click',event=>{const b=event.target.closest('[data-view],[data-save],[data-reset]');if(!b)return;
 if(b.dataset.view){$('#filter-form')?.reset();view=b.dataset.view;if(view==='new')sort='newest';if($('#sort'))$('#sort').value=sort;render();if(!b.classList.contains('shortcut'))$('#list')?.scrollIntoView({block:'start'});}
 if(b.dataset.save){saved=saved.includes(b.dataset.save)?saved.filter(id=>id!==b.dataset.save):[...saved,b.dataset.save];saveStorage();render();}
 if(b.hasAttribute('data-reset'))reset();
});
$('#filter-form')?.addEventListener('submit',e=>e.preventDefault());
$('#filter-form')?.addEventListener('input',()=>{view='all';render();});
$('#filter-form')?.addEventListener('change',()=>{view='all';render();});
$('#filter-form')?.addEventListener('reset',()=>{view='all';setTimeout(render,0);});
$('#sort')?.addEventListener('change',e=>{sort=e.target.value;render();});
$('#clear-saved')?.addEventListener('click',()=>{saved=[];try{localStorage.removeItem('radar.saved');toast('保存した案件を削除しました。');}catch{toast('この環境では端末の記録を変更できません。');}render();});
$('#clear-visit')?.addEventListener('click',()=>{try{localStorage.removeItem('radar.visit');previousVisit=null;toast('前回訪問の記録を削除しました。');}catch{toast('この環境では端末の記録を変更できません。');}});
try{const response=await fetch('/data/campaigns.json',{cache:'no-cache'});if(!response.ok)throw Error('data');items=await response.json();render();if($('#results'))try{localStorage.setItem('radar.visit',new Date().toISOString());}catch{}}
catch{if($('#results'))$('#results').innerHTML='<div class="empty"><h3>情報を読み込めませんでした</h3><p>通信状況を確かめて、ページを再読み込みしてください。</p></div>';if($('#detail-status'))$('#detail-status').textContent='確認状態を取得できません。下記は保存済みの条件です。公式サイトで現在の受付状況をご確認ください。';}
setInterval(()=>{if(items.length)render();},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&items.length)render();});
