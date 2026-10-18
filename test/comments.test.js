'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const create = require('../extensions/nodebb-plugin-vvjob/lib/comments');

function fixture() {
  const access = { read: true, 'topics:read': true, 'topics:reply': true };
  const topic = { tid: 7, mainPid: 10, locked: 0 };
  const calls = [];
  const rows = [
    { pid: 11, content: '<p>Xin chào 😊</p>', timestamp: 123, user: { username: 'Minh', userslug: 'minh', email: 'private@example.invalid', ip: 'private' }, parent: { content: 'PRIVATE', user: { username: 'Lan' } }, ip: 'PRIVATE' },
    { pid: 12, deleted: 1, content: 'SECRET DELETED' },
  ];
  const dependencies = {
    'controllers/helpers': { formatApiResponse(code, res, data) { res.code = code; res.data = data; } },
    topics: { getTopicData: async () => topic, getTopicPosts: async (...args) => { calls.push(args); return rows; } },
    privileges: { topics: { get: async () => access, canViewDeletedScheduled: () => !topic.deleted && !topic.scheduled } },
    database: { sortedSetCard: async () => 7 },
  };
  const res = { set(key, value) { this[key] = value; } };
  return { service: create(n => dependencies[n]), access, topic, calls, rows, res };
}
test('inline comments enforce read/deleted/scheduled/disabled access before fetching posts', async () => {
  for (const denied of ['read', 'topics:read', 'deleted', 'scheduled', 'disabled']) {
    const f = fixture();
    if (denied === 'deleted' || denied === 'scheduled') f.topic[denied] = 1;
    else f.access[denied] = denied === 'disabled';
    await f.service.list({ uid: 0, params: { tid: '7' }, query: {} }, f.res);
    assert.equal(f.res.code, 404); assert.equal(f.calls.length, 0);
  }
});
test('inline comments preserve native viewer filtering, hide deleted replies and whitelist public fields', async () => {
  const f = fixture();
  await f.service.list({ uid: 9, params: { tid: '7' }, query: {} }, f.res);
  assert.equal(f.res['Cache-Control'], 'private, no-store');
  assert.deepEqual(f.calls[0].slice(1), ['tid:7:posts', 1, 5, 9, false]);
  assert.equal(f.res.data.comments.length, 1);
  assert.equal(f.res.data.comments[0].content, '<p>Xin chào 😊</p>');
  assert.doesNotMatch(JSON.stringify(f.res.data), /PRIVATE|SECRET|email|private@example/);
  assert.equal(f.res.data.hasMore, true); assert.equal(f.res.data.next, 6);
  assert.equal(f.res.data.canReply, true);
  f.access['topics:reply'] = false; f.topic.locked = 1;
  await f.service.list({ uid: 9, params: { tid: '7' }, query: { after: '6' } }, f.res);
  assert.equal(f.res.data.hasMore, false); assert.equal(f.res.data.canReply, false); assert.equal(f.res.data.locked, true);
});
test('guests can read public comments but cannot compose; malformed offsets are rejected', async () => {
  const f = fixture();
  await f.service.list({ uid: 0, params: { tid: '7' }, query: {} }, f.res);
  assert.equal(f.res.data.loggedIn, false); assert.equal(f.res.data.canReply, false);
  for (const after of ['-1', '0', '1.5', 'NaN', '9007199254740992']) {
    await f.service.list({ uid: 9, params: { tid: '7' }, query: { after } }, f.res);
    assert.equal(f.res.code, 400);
  }
});
