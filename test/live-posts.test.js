'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
test('live reply guard ignores already rendered main posts but forwards new and nested-only posts', () => {
  const forwarded = [];
  const native = { onNewPost(data) { forwarded.push(data); } };
  let existing = [];
  const $ = () => ({ on() {}, toArray: () => existing.map(pid => ({ getAttribute: () => pid })) });
  vm.runInNewContext(fs.readFileSync('extensions/nodebb-plugin-vvjob/public/vvjob.js', 'utf8'), {
    $, document: { addEventListener() {} }, window: {}, require(names, cb) { if (names[0] === 'forum/topic/posts') cb(native); },
  });
  const fresh = { posts: [{ pid: 10 }] };
  native.onNewPost(fresh);
  assert.equal(forwarded.length, 1);
  existing = ['10'];
  native.onNewPost({ posts: [{ pid: 10 }] });
  assert.equal(forwarded.length, 1);
  native.onNewPost({ posts: [{ pid: 11 }] });
  assert.equal(forwarded.length, 2);
  native.onNewPost({ posts: [] });
  assert.equal(forwarded.length, 3);
});
