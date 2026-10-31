'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const create=require('../extensions/nodebb-plugin-vvjob/lib/verification-routes');
test('verification center reflects a valid material proof independently of email status',async()=>{
 for(const document of[true,false]){
  const routes=create(()=>({}),{},()=>'',function(){},()=>({valid:async()=>document}));
  routes.service.status=async()=>({status:'unverified',domains:[],available:false});let result;
  await routes.page({uid:1},{render:(name,data)=>{result=data}});
  assert.equal(result.professionVerified,document);assert.equal(result.canRequest,false);
 }
});
