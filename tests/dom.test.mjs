import test from 'node:test';
import assert from 'node:assert/strict';
import {replaceIfChanged,activeBoardTab,freshnessText} from '../src/dom.mjs';
// A small DOM boundary fixture keeps these focus tests dependency-free in CI.
// It supplies real element identity/order; assertions inspect the focused target.
function element({id,href,save,day,card,children=[]}={}){
 const node={id,dataset:{...(save?{save}:{}),...(day?{day}:{}),...(card?{campaignId:card}:{})},children,parent:null,
  getAttribute(name){return name==='href'?(href??null):null;},
  contains(child){return child===this||this.children.some(n=>n.contains(child));},
  closest(selector){return selector==='[data-campaign-id]'?(this.dataset.campaignId?this:this.parent?.closest(selector)||null):null;},
  focus(options){node.focused=true;node.focusOptions=options;},
  querySelectorAll(selector){const all=this.children.flatMap(n=>[n,...n.querySelectorAll('*')]);return all.filter(n=>selector==='*'||selector.split(',').some(s=>s==='[data-campaign-id]'?n.dataset.campaignId:s==='[data-save]'?n.dataset.save:s==='[data-day]'?n.dataset.day:s==='a[href]'?n.getAttribute('href')!==null:s==='button'?n.isButton:false));}
 };for(const child of children)child.parent=node;return node;
}
function card(id){const title=element({href:`/campaigns/${id}/`}),detail=element({href:`/campaigns/${id}/`}),save=element({save:id});save.isButton=true;return {node:element({card:id,children:[save,title,detail]}),title,detail,save};}
function region(before,after,active,extra={}){
 const heading=element({id:'list-title'}),doc={activeElement:active,querySelector:s=>s==='#list-title'?heading:null};
 const root=element({children:before});root.ownerDocument=doc;let markup='before';Object.defineProperty(root,'innerHTML',{get:()=>markup,set:v=>{markup=v;root.children=after;for(const child of after)child.parent=root;}});return {root,heading,...extra};
}
test('periodic card render restores the same surviving detail link, including duplicate hrefs',()=>{
 const before=card('日本語-a'),after=card('日本語-a'),other=card('other');
 const {root}=region([before.node],[after.node,other.node],before.detail);
 replaceIfChanged(root,'after');assert.equal(after.detail.focused,true);assert.notEqual(after.title.focused,true);assert.deepEqual(after.detail.focusOptions,{preventScroll:true});
});
test('removing a focused saved card moves focus to the next saved item',()=>{
 const a=card('a'),b=card('b'),c=card('c'),nextA=card('a'),nextC=card('c');
 const {root}=region([a.node,b.node,c.node],[nextA.node,nextC.node],b.save);
 replaceIfChanged(root,'after');assert.equal(nextC.save.focused,true);assert.notEqual(nextA.save.focused,true);
});
test('removing last saved item focuses the empty-state action, then the heading if no action exists',()=>{
 const before=card('last'),action=element();action.isButton=true;
 const {root}=region([before.node],[action],before.save);replaceIfChanged(root,'after');assert.equal(action.focused,true);
 const last=card('last'),empty=region([last.node],[],last.save);replaceIfChanged(empty.root,'after');assert.equal(empty.heading.focused,true);
});
test('focus outside the changed region is not moved and unchanged markup is not replaced',()=>{
 const outside=element({href:'/outside/'}),old=card('a'),next=card('a'),fixture=region([old.node],[next.node],outside);
 replaceIfChanged(fixture.root,'after');assert.notEqual(next.title.focused,true);assert.notEqual(fixture.heading.focused,true);
 const unchanged=region([old.node],[next.node],old.detail);replaceIfChanged(unchanged.root,'before');assert.equal(unchanged.root.children[0],old.node);
});
test('board state follows effective status for advanced filters and special views',()=>{
 for(const [view,status,expected] of [['all','pending','pending'],['all','ended',null],['all','all',null],['all','upcoming',null],['all','','all'],['free','verified','all'],['saved','all','saved'],['day','all',null],['today','all',null],['tomorrow','all',null]])assert.equal(activeBoardTab(view,{status}),expected,`${view}/${status}`);
});
test('freshness copy is neutral for saved, pending, ended and mixed records',()=>{
 assert.equal(freshnessText(),'公式出典・最終確認日時は各案件の詳細へ');assert.ok(!freshnessText().includes('48時間以内'));assert.equal(freshnessText(3),'前回訪問から追加・変更 3件（全記録）');
});
