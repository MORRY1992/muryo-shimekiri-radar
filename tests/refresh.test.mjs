import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcile} from '../scripts/refresh.mjs';
import fs from 'node:fs/promises';
const data=JSON.parse(await fs.readFile(new URL('../data/campaigns.json',import.meta.url),'utf8'));
test('every campaign and its source, verification, redemption and history survive expiry',()=>{
 const dated=data.flatMap(c=>[c.endAt,c.endDate&&`${c.endDate}T23:59:59+09:00`]).filter(Boolean);
 const future=new Date(Math.max(...dated.map(Date.parse))+86400000).toISOString();
 const once=reconcile(data,[],future);
 assert.deepEqual(once.map(c=>c.id),data.map(c=>c.id));
 for(const [i,c] of data.entries()){
  const next=once[i];
  for(const key of Object.keys(c).filter(k=>!['verificationStatus','reviewReason','history'].includes(k)))assert.deepEqual(next[key],c[key],`${c.id}: preserve ${key}`);
  assert.deepEqual(next.history.slice(0,c.history.length),c.history,`${c.id}: retained history`);
  if(c.endAt||c.endDate||c.verificationStatus==='ended')assert.equal(next.verificationStatus,'ended',c.id);
  else assert.equal(next.verificationStatus,'pending',`${c.id}: undated is not falsely ended`);
 }
 assert.deepEqual(reconcile(once,[],future),once);
});
test('expiry accepts changing catalog sizes and never drops an entry',()=>{
 for(const size of [1,3,17,42]){
  const catalog=Array.from({length:size},(_,i)=>({...structuredClone(data[0]),id:`fixture-${i}`,officialUrl:`https://example.org/${i}`,verificationStatus:'verified',endAt:'2026-12-01T12:00:00+09:00',endDate:null,history:[]}));
  const result=reconcile(catalog,[],'2026-12-01T12:00:00+09:00');
  assert.equal(result.length,size);assert.ok(result.every(c=>c.verificationStatus==='ended'));
  assert.deepEqual(result.map(c=>c.id),catalog.map(c=>c.id));
  assert.ok(result.every(c=>c.history.length===1&&c.history[0].kind==='expired'));
 }
});
test('unknown observation aborts entire batch',()=>assert.throws(()=>reconcile(data,[{id:'unrecognized',at:'2026-11-02T12:00:00Z',ok:true}]),/invalid observation/));
