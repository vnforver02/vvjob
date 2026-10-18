'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const create = require('../extensions/nodebb-plugin-vvjob/lib/verification');
function fixture() {
  const objects = new Map(), sets = new Map(); let clock = 1800000000000, tail = Promise.resolve(), ready = true, transportVersion = 'a', mailError = false;
  const db = {
    getObject: async k => objects.has(k) ? { ...objects.get(k) } : null,
    setObject: async (k, v) => objects.set(k, { ...objects.get(k), ...v }),
    setObjectField: async (k, f, v) => db.setObject(k, { [f]: v }),
    delete: async k => objects.delete(k), expire: async () => {},
    incrObjectField: async (k, f) => { const value = Number(objects.get(k)?.[f] || 0) + 1; await db.setObjectField(k, f, value); return value; },
    sortedSetAdd: async (k, score, id) => { if (!sets.has(k)) { sets.set(k, new Map()); } sets.get(k).set(id, score); },
    getSortedSetRevRange: async (k, start, stop) => [...(sets.get(k) || [])].sort((a,b) => b[1]-a[1]).slice(start,stop+1).map(([id]) => id),
    getObjects: async keys => Promise.all(keys.map(db.getObject)),
  };
  const companies = { a: { id:'a', name:'Alpha' }, b: { id:'b', name:'Beta' } };
  const directory = { resolve: async id => companies[id] || null }, messages = [];
  const options = { db, directory, secret: 'test-only-key-that-is-not-a-production-secret',
    withLock: fn => { const work = tail.then(fn); tail = work.catch(() => {}); return work; },
    now: () => clock, code: () => '123456', mailReady: async () => ready, mailSignature: () => transportVersion,
    send: async (...args) => { if (mailError) { throw Error('smtp failure with private recipient'); } messages.push(args); },
  };
  const service = create(options);
  async function init() {
    await db.setObject('vvjob:career:1', { companyId:'a', companyBinding:'binding-1', publicCompany:0 });
    await db.setObject('vvjob:career:2', { companyId:'a', companyBinding:'binding-2', publicCompany:0 });
    await service.savePolicy(99,{domain:'alpha.example',companyId:'a',source:'https://alpha.example/about',note:'Checked official domain',active:true,confirmOwnership:true});
    await service.settings(99,{enabled:true,deliveryConfirmed:true});
  }
  return { db, objects, companies, service, messages, options, init, advance: ms => { clock += ms; }, setReady: value => { ready = value; }, setMailError: value => { mailError = value; }, rotateTransport: () => { transportVersion = 'b'; } };
}
async function request(f, uid=1, address='alice@alpha.example') { return f.service.request(uid,{email:address,consent:true},'192.0.2.4'); }
async function verify(f, uid=1, address) { const pending = await request(f,uid,address); return f.service.confirm(uid,{challengeId:pending.challengeId,code:'123456'}); }
test('mailbox and domain validation reject personal providers, shared boxes and malformed addresses', () => {
  for (const address of ['a@gmail.com','info@alpha.example','alice@evil.gmail.com','alice@127.0.0.1','alice\r\nBcc:x@alpha.example','bad@@alpha.example']) { assert.throws(()=>create.email(address)); }
  assert.equal(create.email('Alice@Alpha.Example'),'alice@alpha.example');
  assert.throws(()=>create.domain('alpha.example/path'));
});
test('service stays closed until SMTP readiness and explicit delivery confirmation; config changes close it again', async () => {
  const f=fixture();
  await assert.rejects(request(f)); assert.equal(f.messages.length,0);
  f.setReady(false); await assert.rejects(f.service.settings(99,{enabled:true,deliveryConfirmed:true}));
  f.setReady(true); await f.init(); assert.equal((await f.service.status(1)).available,true);
  f.rotateTransport(); assert.equal((await f.service.status(1)).available,false); await assert.rejects(request(f));
});
test('only approved exact company domains and explicit consent can request a code', async () => {
  const f=fixture(); await f.init();
  await assert.rejects(request(f,1,'alice@sub.alpha.example'));
  await assert.rejects(request(f,1,'alice@beta.example'));
  await assert.rejects(f.service.request(1,{email:'alice@alpha.example',consent:false}));
  await f.db.setObjectField('vvjob:career:1','companyId','b'); await assert.rejects(request(f)); assert.equal(f.messages.length,0);
});
test('confirmation is single use, bound to account and challenge, and exposes no full email or OTP', async () => {
  const f=fixture(); await f.init(); const pending=await request(f);
  await assert.rejects(f.service.confirm(2,{challengeId:pending.challengeId,code:'123456'}));
  await assert.rejects(f.service.confirm(1,{challengeId:'0'.repeat(32),code:'123456'}));
  const results=await Promise.allSettled([f.service.confirm(1,{challengeId:pending.challengeId,code:'123456'}), f.service.confirm(1,{challengeId:pending.challengeId,code:'123456'})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1); assert.equal(await f.service.valid(1),true);
  const stored=JSON.stringify([...f.objects]); assert.equal(stored.includes('alice@alpha.example'),false); assert.equal(stored.includes('123456'),false);
  const status=await f.service.status(1); assert.equal(status.status,'verified'); assert.equal(status.maskedEmail,'a***@alpha.example'); assert.equal(status.codeDigest,undefined); assert.equal(status.emailHash,undefined);
});
test('wrong attempts lock at five, resend waits 60 seconds and supersedes old challenges', async () => {
  const f=fixture(); await f.init(); const first=await request(f); await assert.rejects(request(f));
  for(let i=0;i<5;i++){ await assert.rejects(f.service.confirm(1,{challengeId:first.challengeId,code:'000000'})); }
  assert.equal((await f.service.status(1)).status,'locked');
  await assert.rejects(f.service.confirm(1,{challengeId:first.challengeId,code:'123456'}));
  f.advance(61000); const second=await request(f); assert.notEqual(second.challengeId,first.challengeId);
  await assert.rejects(f.service.confirm(1,{challengeId:first.challengeId,code:'123456'}));
  assert.equal((await f.service.confirm(1,{challengeId:second.challengeId,code:'123456'})).status,'verified');
});
test('codes expire and a failed transport never activates a code or leaks SMTP details', async () => {
  const f=fixture(); await f.init(); const pending=await request(f); f.advance(10*60000+1);
  await assert.rejects(f.service.confirm(1,{challengeId:pending.challengeId,code:'123456'}));
  f.setMailError(true); await assert.rejects(request(f),err=>err.expose && !err.message.includes('private recipient'));
  assert.equal((await f.service.status(1)).status,'failed'); assert.equal(await f.service.valid(1),false);
});
test('changing company away and back, domain policy, expiration or server key invalidates a proof', async () => {
  const f=fixture(); await f.init(); await verify(f);
  await f.db.setObject('vvjob:career:1',{companyId:'b',companyBinding:'changed'}); assert.equal(await f.service.valid(1),false);
  await f.db.setObject('vvjob:career:1',{companyId:'a',companyBinding:'changed-back'}); assert.equal(await f.service.valid(1),false);
  await f.db.setObjectField('vvjob:career:1','companyBinding','binding-1');
  assert.equal(await create({...f.options,secret:'a-different-server-secret-key'}).valid(1),false);
  await f.service.savePolicy(99,{domain:'alpha.example',companyId:'a',source:'https://alpha.example/about',note:'Domain was revoked',active:false,confirmOwnership:true}); assert.equal(await f.service.valid(1),false);
  const g=fixture(); await g.init(); await verify(g); g.advance(181*86400000); assert.equal((await g.service.status(1)).status,'expired');
});
test('one email cannot certify two accounts, withdrawal frees it and account deletion blocks future grants', async () => {
  const f=fixture(); await f.init(); await verify(f);
  await assert.rejects(request(f,2,'alice@alpha.example')); await f.service.revoke(1);
  await verify(f,2,'alice@alpha.example'); assert.equal(await f.service.valid(2),true);
  await f.service.remove(2); assert.equal(await f.service.valid(2),false);
  f.advance(61000); await assert.rejects(request(f,2,'alice@alpha.example'));
});
test('daily send quota survives new challenges', async () => {
  const f=fixture(); await f.init();
  for(let i=0;i<5;i++){await request(f); f.advance(61000);}
  await assert.rejects(request(f)); assert.equal(f.messages.length,5);
});

test('PostgreSQL lock retains non-enumerable pool credentials without exposing them', async () => {
  const options = { host: 'database', database: 'preview' };
  Object.defineProperty(options, 'password', { value: 'synthetic-test-only' });
  Object.defineProperty(options, 'ssl', { value: { rejectUnauthorized: true } });
  const calls = []; let released = false;
  class Pool {
    constructor(config) { assert.equal(config.password, options.password); assert.equal(config.ssl, options.ssl); assert.equal(config.max, 1); }
    async connect() { return { query: async sql => calls.push(sql), release() { released = true; } }; }
  }
  const lock = require('../extensions/nodebb-plugin-vvjob/lib/verification-lock')({ pool: { options } }, Pool);
  assert.equal(await lock(async () => 'done'), 'done');
  assert.equal(calls[0], 'BEGIN'); assert.match(calls[2], /pg_advisory_xact_lock/); assert.equal(calls.at(-1), 'COMMIT'); assert.equal(released, true);
});

test('rendered verification form accepts exactly six digits through Benchpress', async () => {
  const fs = require('node:fs/promises'), benchpress = require('benchpressjs');
  const source = await fs.readFile(require('node:path').join(__dirname, '../extensions/nodebb-plugin-vvjob/templates/vvjob-verification.tpl'), 'utf8');
  const html = await benchpress.compileRender(source, { pending: true, verification: {}, domains: [] });
  const pattern = html.match(/id="verification-code"[^>]*pattern="([^"]+)"/)[1];
  const regex = new RegExp(`^(?:${pattern})$`);
  assert.equal(regex.test('123456'), true); assert.equal(regex.test('12345'), false); assert.equal(regex.test('1234567'), false); assert.equal(regex.test('12345a'), false);
});
