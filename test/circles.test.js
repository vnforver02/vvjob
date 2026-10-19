'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const create=require('../extensions/nodebb-plugin-vvjob/lib/circles');
function fixture(){const careers={1:{companyId:'fpt'},2:{companyId:'fpt',publicCompany:1},3:{companyId:'fpt',publicCompany:0},4:{companyId:'vng',publicCompany:1}};return create(n=>({database:{getObject:async k=>careers[k.split(':').pop()],getObjects:async ks=>ks.map(k=>careers[k.split(':').pop()])},user:{getFollowing:async()=>[{uid:3},{uid:4}]},topics:{getSortedTopics:async()=>({topics:[{tid:2,uid:2},{tid:3,uid:3},{tid:4,uid:4}]})}}[n]));}
test('coworker feed never reveals private company membership',async()=>{const data=await fixture()('coworkers',1);assert.deepEqual(data.topics.map(t=>t.uid),[2]);});
test('network uses real follows and native visible posts, not a user directory or fabricated connections',async()=>{assert.deepEqual((await fixture()('network',1)).topics.map(t=>t.uid),[3,4]);});
test('circles truthfully prompt guests and members without a company',async()=>{assert.equal((await fixture()('coworkers',0)).circleNeedsLogin,true);assert.equal((await fixture()('coworkers',99)).circleNeedsCompany,true);});
