'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {record,avatar,BATCH}=require('../extensions/nodebb-plugin-vvjob/lib/demo-users');
const identity=require('../extensions/nodebb-plugin-vvjob/lib/identity');
test('500 fictional identities are unique, gender balanced and exactly half simulated verified',()=>{
 const rows=Array.from({length:500},(_,i)=>record(i+1));assert.equal(new Set(rows.map(r=>r.username)).size,500);assert.equal(rows.filter(r=>r.gender==='female').length,250);assert.equal(rows.filter(r=>r.simulatedVerified).length,250);
 assert.equal(new Set(rows.map(r=>avatar(r.index))).size,500);
 for(const r of rows){assert.match(avatar(r.index),/DEMO/);assert.doesNotMatch(avatar(r.index),/<script|foreignObject|href=/)}assert.throws(()=>avatar(0));assert.throws(()=>avatar(501));
});
test('demo badges cannot become real verification and private career cannot disclose a real proof',async()=>{
 let checks=0;const evidence={valid:async()=>{checks++;return true}};
 const demo=identity({getObject:async()=>({batch:BATCH,simulatedVerified:1})},evidence);
 const badge=await demo(3,{companyId:'fpt'});assert.equal(badge.verified,false);assert.equal(badge.simulatedVerified,true);assert.equal(checks,0);
 const real=identity({getObject:async()=>null},evidence);
 assert.equal((await real(1,null)).verified,false);assert.equal(checks,0);
 assert.equal((await real(1,{companyId:'fpt'})).verified,true);assert.equal(checks,1);
});
