'use strict';
const assert=require('node:assert/strict');
const {launch}=require('./browser.cjs');
const base=process.env.VVJOB_QA_BASE||'https://127.0.0.1:14632';
if(new URL(base).hostname!=='127.0.0.1')throw Error('Login mutation checks require the loopback clone');
(async()=>{const driver=await launch(base);try{
const c=await driver.browser.newContext({ignoreHTTPSErrors:true}),p=await c.newPage();
await p.goto(base+'/login');
for(const slug of['hello','vvjob-member-20261031']){const r=await c.request.head(base+'/api/v3/users/bySlug/'+slug);assert.equal(r.status(),200);assert.equal((await r.body()).length,0);}
const missing=await c.request.head(base+'/api/v3/users/bySlug/qa-missing-'+Date.now());assert.equal(missing.status(),404);
for(const route of['/api/user/hello','/api/v3/users/bySlug/hello','/api/v3/users/1']){const r=await c.request.get(base+route);assert.equal(r.status(),401);assert(!/userslug|fullname/.test(await r.text()));}
await p.goto(base+'/user/hello');await p.waitForURL(/\/login/);
await p.fill('#username','vvjob-member-20261031');await p.fill('#password',process.env.VVJOB_QA_PASSWORD);await p.click('#login');await p.waitForURL(/\/user\/hello$/);await p.waitForFunction(()=>window.app?.user?.uid>0);assert.equal(await p.evaluate(()=>ajaxify.data.template.name),'account/profile');
console.log('PASS guest bodyless existence, denied profile APIs and full profile return after login');
}finally{await driver.close();}})().catch(e=>{console.error(e);process.exitCode=1});
