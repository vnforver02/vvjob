'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const next=require('../extensions/nodebb-plugin-vvjob/lib/registration-next');
const gate=require('../extensions/nodebb-plugin-vvjob/lib/member-api');
test('registration resumes safe site pages and rejects internal API, off-site and mounted-prefix return paths',()=>{
 for(const value of[null,'/bySlug/hello','/api/v3/users/1','/login','https://evil.invalid/','//evil.invalid/','/\\evil.invalid/','/admin','/vvjob/verification-admin'])assert.equal(next(value),'/vvjob');
 for(const value of['/','/topic/42/name?sort=recent#2','/users?tab=peers','/user/hello','/vvjob/career'])assert.equal(next(value),value);
 assert.equal(next('/forum/topic/1','/forum'),'/forum/topic/1');assert.equal(next('/forumish/topic/1','/forum'),'/forum/vvjob');assert.equal(next('/bySlug/hello','/forum'),'/forum/vvjob');
});
test('guest HEAD username/uid existence stays bodyless while profile data remains member-only without changing returnTo',()=>{
 const request=(method,path,member=false)=>{let allowed=false,status;const req={method,path,uid:member?1:0,loggedIn:member,session:{returnTo:'/topic/42'}};gate((code)=>{status=code})(req,{},()=>{allowed=true});assert.equal(req.session.returnTo,'/topic/42');return{allowed,status};};
 for(const path of['/bySlug/hello','/1','/21/'])assert.equal(request('HEAD',path).allowed,true);
 for(const method of['GET','POST','PUT','DELETE'])for(const path of['/bySlug/hello','/1','/1/status'])assert.equal(request(method,path).status,401);
 for(const path of['/1/exports/profile','/bySlug/hello/settings','/0'])assert.equal(request('HEAD',path).status,401);
 assert.equal(request('GET','/1',true).allowed,true);
});
