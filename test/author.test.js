'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const create=require('../extensions/nodebb-plugin-vvjob/lib/author');
test('career author metadata stays member-only and respects publicCompany, including own private career',async()=>{
 let lookedUp=0,seen;
 const directory={profile:async()=>{lookedUp++;return{publicCompany:0,position:'PRIVATE',companyName:'PRIVATE',companyId:'secret'}}};
 const author=create(directory,async(uid,career)=>{seen=career;return{verified:true,verificationLabel:'Checked'}});
 assert.equal((await author(1,0)).careerLine,'');assert.equal(lookedUp,0);assert.equal(seen,null);
 const own=await author(1,1);assert.equal(own.verified,false);assert.equal(own.careerLine,'');assert.doesNotMatch(JSON.stringify(own),/PRIVATE|secret/);
 directory.profile=async()=>({publicCompany:1,position:'Kỹ sư',companyName:'Công ty',companyId:'private-binding'});
 const publicMeta=await author(1,2);assert.equal(publicMeta.careerLine,'Kỹ sư · Công ty');assert.equal(publicMeta.verified,true);assert.doesNotMatch(JSON.stringify(publicMeta),/private-binding|companyId/);
});
test('demo author badge stays distinct from real verification',async()=>{
 const author=create({profile:async()=>null},async()=>({isDemo:true,simulatedVerified:true,verified:false}));
 const meta=await author(5,0);assert.equal(meta.isDemo,true);assert.equal(meta.simulatedVerified,true);assert.equal(meta.verified,false);
});
