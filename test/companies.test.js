'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const create = require('../extensions/nodebb-plugin-vvjob/lib/companies');
function memory() {
  const objects = new Map(), sets = new Map();
  const db = {
    getObject: async k => objects.has(k) ? { ...objects.get(k) } : null,
    setObject: async (k, value) => objects.set(k, { ...objects.get(k), ...value }),
    setObjectField: async (k, field, value) => db.setObject(k, { [field]: value }),
    getObjects: async keys => Promise.all(keys.map(db.getObject)),
    sortedSetAdd: async (k, score, value) => { if (!sets.has(k)) { sets.set(k, new Map()); } sets.get(k).set(value, score); },
    sortedSetRemove: async (k, value) => sets.get(k)?.delete(value),
    sortedSetCount: async (k, min) => [...(sets.get(k) || [])].filter(([, score]) => score >= min).length,
    getSortedSetRevRange: async (k, start, stop) => [...(sets.get(k) || [])].sort((a, b) => b[1] - a[1]).slice(start, stop + 1).map(([id]) => id),
    expire: async () => {},
  };
  return db;
}
const company = { name: 'Hòa Phát', aliases: 'Hoa Phat HPG', website: 'https://www.hoaphat.com.vn/', source: 'https://www.hoaphat.com.vn/' };
test('company URLs and fields reject scripts, private literal URLs and oversized input', () => {
  for (const website of ['javascript:alert(1)', 'http://example.com', 'https://127.0.0.1/', 'https://[::1]/', 'https://user:pass@example.com/', 'https://foo.local/']) {
    assert.throws(() => create.validate({ ...company, website }));
  }
  assert.throws(() => create.validate({ ...company, name: '<img onerror=alert(1)>' }));
  assert.throws(() => create.validate({ ...company, aliases: 'x'.repeat(301) }));
});
test('submissions remain private until approved; accent-insensitive search and no domain auto-verification', async () => {
  const d = create(memory()), row = await d.submit(4, company);
  assert.equal((await d.list()).total, 0);
  await d.review(1, { id: row.id, action: 'approve' });
  const found = await d.list('approved', 'hoa phat');
  assert.equal(found.total, 1); assert.equal(found.companies[0].claimStatus, 'unclaimed');
  assert.equal(found.companies[0].verification, undefined);
});
test('private career data stays private even from administrators; client cannot grant verification', async () => {
  const d = create(memory()); await d.importRows(1, [{ ...company, id: 'hoa-phat' }], false);
  await d.saveProfile(4, { workStatus: 'employed', companyId: 'hoa-phat', position: 'Engineer', publicCompany: false, verification: 'verified', uid: 5 });
  assert.equal(await d.profile(4, 0), null); assert.equal(await d.profile(4, 1), null);
  assert.equal((await d.profile(4, 4)).verification, 'unverified'); assert.equal(await d.profile(5, 5), null);
  await d.saveProfile(4, { workStatus: 'employed', companyId: 'hoa-phat', publicCompany: true });
  assert.equal((await d.profile(4, 0)).companyName, 'Hòa Phát');
  await assert.rejects(d.saveProfile(4, { workStatus: 'employed', companyId: 'missing' }));
});
test('merging keeps existing profiles linked and rejects cycles; hiding removes selection', async () => {
  const d = create(memory()); await d.importRows(1, [{ ...company, id: 'a', name: 'Old Brand' }, { ...company, id: 'b' }], false);
  await d.saveProfile(4, { workStatus: 'employed', companyId: 'a', publicCompany: true });
  await d.review(1, { id: 'a', action: 'merge', targetId: 'b' });
  assert.equal((await d.profile(4, 0)).companyId, 'b');
  assert.equal((await d.list('approved', 'old brand')).total, 1);
  await assert.rejects(d.review(1, { id: 'b', action: 'merge', targetId: 'a' }));
  await d.review(1, { id: 'b', action: 'reject' }); assert.equal(await d.resolve('a'), null);
});
test('imports preview without writes, validate whole batch and are idempotent', async () => {
  const d = create(memory()), rows = [{ ...company, id: 'hoa-phat' }];
  assert.equal((await d.importRows(1, rows)).added, 1); assert.equal((await d.list()).total, 0);
  await assert.rejects(d.importRows(1, [...rows, { id: 'bad', name: '' }], false)); assert.equal((await d.list()).total, 0);
  await d.importRows(1, rows, false); assert.equal((await d.importRows(1, rows, false)).skipped, 1);
});
test('submission rate limit and logo review validation', async () => {
  const d = create(memory());
  let row; for (let i = 0; i < 5; i++) { row = await d.submit(4, company); }
  await assert.rejects(d.submit(4, company));
  await assert.rejects(d.review(1, { id: row.id, action: 'logo', logoUrl: 'javascript:1', logoSource: company.source }));
  await d.review(1, { id: row.id, action: 'logo', logoUrl: 'https://cdn.example.com/logo.png', logoSource: company.source });
  assert.equal((await d.get(row.id)).logoStatus, 'reviewed');
});
test('routes block non-admin review and do not expose proposal submitter in public search', async () => {
  const d = create(memory()); await d.importRows(1, [{ ...company, id: 'hoa-phat' }], false);
  const routes = require('../extensions/nodebb-plugin-vvjob/lib/career-routes')(() => ({ isAdministrator: async uid => uid === 1 }), d, []);
  let status; await routes.admin({ uid: 4 }, { status: s => { status = s; return { json() {} }; } }, () => assert.fail('unauthorized'));
  assert.equal(status, 403);
  let data; await routes.search({ query: {} }, { json: value => { data = value; } });
  assert.equal(data.companies[0].reviewedBy, undefined); assert.equal(data.companies[0].submittedBy, undefined);
});

test('structured career fields normalize aliases and reject invalid IDs or role/family combinations', async () => {
  const d = create(memory());
  await d.saveProfile(4, { workStatus: 'employed', positionId: 'software-engineer', jobFamilyId: 'engineering', industryId: 'technology', cityId: 'ha-noi', levelId: 'senior' });
  const p = await d.profile(4, 4);
  assert.equal(p.position, 'Kỹ sư phần mềm'); assert.equal(p.city, 'Hà Nội'); assert.equal(p.levelId, 'senior');
  await assert.rejects(d.saveProfile(4, { workStatus: 'employed', positionId: 'software-engineer', jobFamilyId: 'marketing' }));
  await assert.rejects(d.saveProfile(4, { workStatus: 'employed', cityId: 'invalid' }));
  await assert.rejects(d.saveProfile(4, { workStatus: 'employed', positionId: 'other', position: '' }));
  await d.saveProfile(4, { workStatus: 'employed', position: 'Developer', city: 'HCMC' });
  assert.equal((await d.profile(4, 4)).positionId, 'software-engineer');
  assert.equal((await d.profile(4, 4)).cityId, 'thanh-pho-ho-chi-minh');
  await d.saveProfile(4, { workStatus: 'employed', position: 'Legacy title', city: 'Legacy location' });
  assert.equal((await d.profile(4, 4)).position, 'Legacy title');
});
test('company filters combine search, normalized industry and city, before pagination', async () => {
  const d = create(memory());
  await d.importRows(1, [{ ...company, id: 'a', name: 'Zulu', industry: 'Công nghệ', city: 'Hà Nội' }, { ...company, id: 'b', name: 'Alpha', industryId: 'technology' }, { ...company, id: 'c', name: 'Bank', industryId: 'banking', cityId: 'ha-noi' }], false);
  assert.equal((await d.list('approved', '', 0, { industry: 'technology' })).total, 2);
  assert.equal((await d.list('approved', '', 0, { industry: 'technology', city: 'ha-noi' })).total, 1);
  assert.equal((await d.list('approved', '', 0, { city: 'unknown' })).total, 1);
  assert.equal((await d.list('approved', 'bank', 0, { industry: 'technology' })).total, 0);
  assert.equal((await d.list('approved', '', 0, { sort: 'name' })).companies[0].name, 'Alpha');
});
test('career taxonomy has 34 unique current provinces, valid role families and no empty-string matching', () => {
  const t = require('../extensions/nodebb-plugin-vvjob/lib/taxonomy');
  assert.equal(t.catalog.cities.length, 34); assert.equal(new Set(t.catalog.cities.map(row => row.id)).size, 34);
  for (const role of t.catalog.positions) { assert.ok(t.catalog.families.some(family => family.id === role.family)); }
  for (const kind of ['positions','levels','cities','industries']) { assert.equal(t.find(kind, ''), undefined); assert.equal(new Set(t.catalog[kind].map(row => row.id)).size, t.catalog[kind].length); }
});
