import {selectCampaigns,statusOf,STATUS,dayJst,esc,deadlineDay,validateCampaigns} from './core.mjs';
import {card,calendar} from './render.mjs';
import {icon} from './visuals.mjs';
const $=s=>document.querySelector(s);let items=[],saved=[],previousVisit=null,view='all',sort='deadline',selectedDay='';
try{const raw=JSON.parse(localStorage.getItem('radar.saved')||'[]');saved=Array.isArray(raw)?raw.filter(x=>typeof x==='string'):[];previousVisit=localStorage.getItem('radar.visit');}catch{}
const toast=message=>{const el=$('#toast');if(!el)return;el.textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.textContent='',3500);};
function saveStorage(){try{localStorage.setItem('radar.saved',JSON.stringify(saved));return true;}catch{toast('この環境では保存できません。今回の画面内でのみ保持します。');return false;}}
const presets={today:{deadline:'today',status:'all'},tomorrow:{deadline:'tomorrow',status:'all'},free:{purchase:'no'},'no-register':{registration:'no'},first:{redeem:true},lottery:{award:'lottery'},daily:{daily:true},week:{deadline:'week'},saved:{saved:true,status:'all'},pending:{status:'pending'},ended:{status:'ended'},new:{},day:{status:'all'}};
function filters(){const f=$('#filter-form')?Object.fromEntries(new FormData($('#filter-form'))):{};return {...f,...presets[view],sort,savedIds:saved,...(selectedDay?{exactDay:selectedDay}:{})};}
const viewTitles={today:'今日締切のキャンペーン',tomorrow:'明日締切のキャンペーン',free:'購入不要で応募できる','no-register':'会員登録不要',first:'無料引換・先着特典',lottery:'抽選キャンペーン',daily:'毎日応募できる企画',week:'今週終了予定',saved:'保存した案件',pending:'再確認待ち',ended:'終了した案件',new:'新着キャンペーン'};
function replaceIfChanged(el,html){if(!el||el.innerHTML===html)return;const active=el.contains(document.activeElement)?document.activeElement:null;const saveId=active?.dataset.save,day=active?.dataset.day;el.innerHTML=html;if(saveId)el.querySelector(`[data-save="${saveId}"]`)?.focus({preventScroll:true});else if(day)el.querySelector(`[data-day="${day}"]`)?.focus({preventScroll:true});}
function filterChips(){
 const form=$('#filter-form');if(!form)return;
 const chips=[];for(const el of form.elements){if(!el.name||!el.value)continue;const label=el.tagName==='SELECT'?el.options[el.selectedIndex].textContent:el.name==='q'?`検索：${el.value}`:`${el.value}まで`;chips.push(label);}
 if(selectedDay)chips.push(`${Number(selectedDay.slice(5,7))}/${Number(selectedDay.slice(8,10))} 応募締切`);
 if(view==='daily')chips.push('毎日応募');if(view==='first')chips.push('無料引換・先着');
 $('#filter-total').textContent=chips.length?`${chips.length}条件`:'';
 replaceIfChanged($('#active-filters'),chips.length?chips.map(x=>`<span>${esc(x)}</span>`).join('')+'<button type="button" data-reset>クリア ×</button>':'');
}
function render(){const now=new Date();
 if($('#results')){
  const f=filters();let list=selectCampaigns(items,f,now);
  if(['today','tomorrow','day'].includes(view))list=list.filter(c=>!['ended','upcoming'].includes(statusOf(c,now)));
  const hasFilters=Object.values(Object.fromEntries(new FormData($('#filter-form')))).some(Boolean)||Boolean(selectedDay);
  const pendingCount=items.filter(c=>statusOf(c,now)==='pending').length;
  const emptyText=view==='saved'?['保存した案件はまだありません','気になる案件の保存ボタンを押すと、このブラウザーであとから確認できます。']:view==='pending'?['再確認待ちの案件はありません','条件が確認できた情報は、確認済みの一覧から探せます。']:hasFilters||view!=='all'?['この条件の案件はありません','条件を変えると、別のチャンスが見つかるかもしれません。']:['確認済みの案件は現在ありません','確認から48時間を過ぎた情報や、条件が不足する情報は「再確認待ち」に分けています。'];
  replaceIfChanged($('#results'),list.length?list.map(c=>card(c,now,saved.includes(c.id),Boolean(previousVisit&&c.history.some(h=>Date.parse(h.at)>Date.parse(previousVisit))))).join(''):`<div class="empty">${icon(view==='saved'?'bookmark':'search')}<h3>${emptyText[0]}</h3><p>${emptyText[1]}</p><div class="empty-actions">${view!=='pending'&&pendingCount?`<button type="button" data-view="pending">再確認待ちを見る（${pendingCount}件）</button>`:''}<button type="button" data-reset>${hasFilters||view!=='all'?'条件をクリアして確認済みへ':'確認済みの一覧を更新'}</button></div></div>`);
  $('#result-count').textContent=`${list.length}件`;
  $('#list-title').textContent=selectedDay?`${Number(selectedDay.slice(5,7))}/${Number(selectedDay.slice(8,10))} 締切のキャンペーン`:viewTitles[view]||'キャンペーンを探す';
  const state=f.status||'verified',note=$('#view-note');
  const message=view==='ended'||state==='ended'?'応募は終了しています。引換期限が残る場合は詳細をご確認ください。':view==='saved'?'このブラウザーに保存した案件です。通知や応募完了の記録ではありません。終了・再確認待ちも含みます。':view==='pending'||state==='pending'?'条件・期限の不足、取得失敗、確認から48時間経過などにより、現在利用できると断定していません。受付状況は公式でご確認ください。':['today','tomorrow','day'].includes(view)||state==='all'?'再確認待ちも含みます。「公式条件確認済み」は在庫や受付の継続を保証しません。応募前に公式ページをご確認ください。':'';
  note.hidden=!message;note.textContent=message;
  document.querySelectorAll('[data-view]').forEach(b=>{if(!b.closest('.empty'))b.setAttribute('aria-pressed',String(b.dataset.view===view));});
  const today=dayJst(now),tomorrow=dayJst(+now+86400000),eligibleDay=day=>items.filter(c=>deadlineDay(c)===day&&!['ended','upcoming'].includes(statusOf(c,now))).length;
  for(const [key,value] of Object.entries({today:eligibleDay(today),tomorrow:eligibleDay(tomorrow),free:selectCampaigns(items,{purchase:'no'},now).length,verified:selectCampaigns(items,{},now).length}))$(`[data-count="${key}"]`).textContent=value;
  $('[data-state-count="pending"]').textContent=pendingCount;
  $('[data-state-count="saved"]').textContent=items.filter(c=>saved.includes(c.id)).length;
  document.querySelectorAll('[data-category-count]').forEach(el=>el.textContent=selectCampaigns(items,{category:el.dataset.categoryCount},now).length);
  $('#today-date').textContent=now.toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit'});
  $('#today-weekday').textContent=now.toLocaleDateString('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',weekday:'long'})+' / JST';
  replaceIfChanged($('#deadline-calendar'),calendar(items,now,selectedDay));
  const changed=previousVisit&&Number.isFinite(Date.parse(previousVisit))?items.filter(c=>c.history.some(h=>Date.parse(h.at)>Date.parse(previousVisit))).length:null;
  $('#freshness').textContent=changed===null?'最終確認から48時間以内の情報を表示':`前回訪問から追加・変更 ${changed}件（全記録）`;
  filterChips();
 }
 const detail=$('[data-detail]');if(detail){const c=items.find(x=>x.id===detail.dataset.detail);if(c){const status=statusOf(c,now);$('#detail-status').textContent=`${STATUS[status]}｜${status==='verified'?'確認時点の公式条件です。先着終了や変更がないか、応募前に公式サイトをご確認ください。':status==='ended'?'応募期限を過ぎています。引換期限は別にご確認ください。':status==='upcoming'?'記録上の応募開始日時より前です。開始日時と最新の条件を公式でご確認ください。':c.reviewReason||'条件・期限の不足、締切時刻未公表、または確認情報の更新待ちです。受付状況は公式でご確認ください。'}`;}}
 document.querySelectorAll('[data-save]').forEach(b=>{const yes=saved.includes(b.dataset.save),c=items.find(c=>c.id===b.dataset.save);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',`${c?.title||'この案件'}${yes?'の保存を解除':'を保存'}`);const label=b.querySelector('span');if(label)label.textContent=yes?'保存済み・解除する':'この案件を保存';});
}
function reset(){view='all';selectedDay='';$('#filter-form')?.reset();sort='deadline';if($('#sort'))$('#sort').value=sort;render();}
function setView(next,scroll=false){$('#filter-form')?.reset();view=next;selectedDay='';sort=next==='new'?'newest':'deadline';const form=$('#filter-form');for(const [k,v] of Object.entries(presets[next]||{})){const el=form?.elements.namedItem(k);if(el)el.value=v;}if($('#sort'))$('#sort').value=sort;render();if(scroll)$('#list')?.scrollIntoView({block:'start'});}
document.addEventListener('click',event=>{const b=event.target.closest('[data-view],[data-save],[data-reset],[data-day],[data-category]');if(!b)return;
 if(b.dataset.view)setView(b.dataset.view,!b.classList.contains('shortcut')&&!b.closest('.board-tabs'));
 if(b.dataset.save){const removed=saved.includes(b.dataset.save);saved=removed?saved.filter(id=>id!==b.dataset.save):[...saved,b.dataset.save];if(saveStorage())toast(removed?'保存を解除しました。':'このブラウザーに保存しました。');render();}
 if(b.hasAttribute('data-reset'))reset();
 if(b.dataset.day){setView('day');selectedDay=b.dataset.day;render();$('#list')?.scrollIntoView({block:'start'});}
 if(b.dataset.category){reset();$('#filter-form').elements.namedItem('category').value=b.dataset.category;render();$('#list')?.scrollIntoView({block:'start'});}
});
$('#filter-form')?.addEventListener('submit',e=>e.preventDefault());
$('#filter-form')?.addEventListener('input',()=>{view='all';selectedDay='';render();});
$('#filter-form')?.addEventListener('change',()=>{view='all';selectedDay='';render();});
$('#filter-form')?.addEventListener('reset',()=>{view='all';selectedDay='';sort='deadline';if($('#sort'))$('#sort').value=sort;setTimeout(render,0);});
$('#sort')?.addEventListener('change',e=>{sort=e.target.value;render();});
$('#clear-saved')?.addEventListener('click',()=>{saved=[];try{localStorage.removeItem('radar.saved');toast('保存した案件を削除しました。');}catch{toast('この環境では端末の記録を変更できません。');}render();});
$('#clear-visit')?.addEventListener('click',()=>{try{localStorage.removeItem('radar.visit');previousVisit=null;toast('前回訪問の記録を削除しました。');}catch{toast('この環境では端末の記録を変更できません。');}});
window.addEventListener('hashchange',()=>{if(location.hash==='#saved'&&$('#results'))setView('saved',true);});
try{const response=await fetch('/data/campaigns.json',{cache:'no-cache'});if(!response.ok)throw Error('data');items=await response.json();validateCampaigns(items);if(location.hash==='#saved'&&$('#results'))setView('saved');else render();if($('#results'))try{localStorage.setItem('radar.visit',new Date().toISOString());}catch{}}
catch{if($('#results'))$('#results').innerHTML=`<div class="empty">${icon('radar')}<h3>情報を読み込めませんでした</h3><p>通信状況を確かめて、ページを再読み込みしてください。<br>現在の受付状況は、各主催者の公式サイトでご確認ください。</p></div>`;if($('#detail-status'))$('#detail-status').textContent='確認状態を取得できません。下記は保存済みの条件です。公式サイトで現在の受付状況をご確認ください。';}
setInterval(()=>{if(items.length)render();},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&items.length)render();});
