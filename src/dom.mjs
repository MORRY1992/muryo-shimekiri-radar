// Preserve the user's place when clock/status or saved-state updates replace cards.
const nodes=(root,selector)=>Array.from(root?.querySelectorAll(selector)||[]);
function signature(el){
 if(el?.dataset?.save)return {kind:'save',value:el.dataset.save};
 if(el?.dataset?.day)return {kind:'day',value:el.dataset.day};
 const href=el?.getAttribute?.('href');return href!==null&&href!==undefined?{kind:'href',value:href}:null;
}
function matching(root,key){
 if(!key)return [];
 const selector=key.kind==='save'?'[data-save]':key.kind==='day'?'[data-day]':'a[href]';
 return nodes(root,selector).filter(el=>signature(el)?.value===key.value);
}
export function replaceIfChanged(el,html){
 if(!el||el.innerHTML===html)return;
 const doc=el.ownerDocument,active=el.contains(doc.activeElement)?doc.activeElement:null;
 const key=signature(active),oldCard=active?.closest('[data-campaign-id]');
 const cardId=oldCard?.dataset.campaignId,oldCards=nodes(el,'[data-campaign-id]');
 const oldIndex=oldCard?oldCards.indexOf(oldCard):-1;
 const occurrence=key?matching(oldCard||el,key).indexOf(active):0;
 el.innerHTML=html;
 if(!active)return;
 const newCards=nodes(el,'[data-campaign-id]');
 const sameCard=cardId?newCards.find(card=>card.dataset.campaignId===cardId):null;
 let target=matching(sameCard||el,key)[Math.max(0,occurrence)];
 if(!target&&oldIndex>=0&&newCards.length){
  const nextCard=newCards[Math.min(oldIndex,newCards.length-1)];
  target=key?.kind==='save'?nodes(nextCard,'[data-save]')[0]:nodes(nextCard,'a[href]')[0];
  target||=nodes(nextCard,'a[href],button')[0];
 }
 target||=nodes(el,'button,a[href]')[0];
 target||=doc.querySelector('#list-title');
 target?.focus({preventScroll:true});
}
export function activeBoardTab(view,filters={}){
 if(view==='saved')return 'saved';
 if(['day','today','tomorrow'].includes(view))return null;
 const status=filters.status||'verified';
 return status==='verified'?'all':status==='pending'?'pending':null;
}
export function freshnessText(changed=null){return changed===null?'公式出典・最終確認日時は各案件の詳細へ':`前回訪問から追加・変更 ${changed}件（全記録）`;}
