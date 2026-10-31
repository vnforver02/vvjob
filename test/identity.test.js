'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const create=require('../extensions/nodebb-plugin-vvjob/lib/identity');
const db={getObject:async()=>null};
test('public genuine verification uses a single label regardless of proof channel',async()=>{
 for(const [document,email] of [[true,false],[false,true],[true,true],[false,false]]){
  const result=await create(db,{valid:async()=>document},{valid:async()=>email})(1,{companyId:'company'});
  assert.equal(result.verified,document||email);
  assert.equal(result.verificationLabel,document||email?'Đã xác minh nghề nghiệp':'');
  assert.doesNotMatch(JSON.stringify(result),/email|giấy tờ|contract|social-security/);
 }
});
test('uniform badge does not grant verification without a company or valid proof',async()=>{
 const identity=create(db,{valid:async()=>true},{valid:async()=>true});assert.equal((await identity(1,null)).verified,false);
 const demo=create({getObject:async()=>({batch:'vvjob-fixture-200-20261020',simulatedVerified:1})});const result=await demo(2,{companyId:'company'});assert.equal(result.verified,false);assert.equal(result.previewFixture,true);
});
test('profile JSON and public profile labels do not disclose a genuine proof method',async()=>{
 const createRoutes=require('../extensions/nodebb-plugin-vvjob/lib/career-routes');
 for(const [document,email]of[[true,false],[false,true]]){
  const host=name=>name==='database'?db:{};
  const directory={profile:async()=>({companyId:'co',companyName:'Company',publicCompany:1,verification:'self-declared'})};
  const routes=createRoutes(host,directory,[],{valid:async()=>email},{valid:async()=>document});
  const result=await routes.profileData({callerUID:2,userData:{uid:1}});
  assert.equal(result.userData.vvjobCareer.isVerified,true);
  assert.equal(result.userData.vvjobIdentity.verificationLabel,'Đã xác minh nghề nghiệp');
  assert.doesNotMatch(JSON.stringify(result),/work-email|hasWorkEmailVerification|hasDocumentVerification|qua giấy tờ/);
 }
});
